const Joi = require('joi');
const db = require("@db");
const { convertNeo4jIntegers } = require("@utilitaries");

module.exports = {
    list: {
        validation: {
            body: Joi.object({
            }),
        },
        route: async (req, res) => {
            if (true) {
                gamesArray = [];
                res.status(200).json({ gamesArray });
                return;
            }

            const games = await db.all("Game");

            gamesArray = [];
            gamesCount = games.length;
            for (let i = 0; i < gamesCount; i++) {
                gamesArray.push(games.get(i).properties());
            }

            res.status(200).json(gamesArray);
        }
    },
    get: {
        validation: {
            params: Joi.object({
                gameId: Joi.number().integer().required(),
            }),
        },
        route: async (req, res) => {
            const gameId = Number(req.params.gameId);


            const result = await db.cypher(
                `MATCH (g:Game {igdb_id: $gameId})
                 OPTIONAL MATCH (g)-[:AVAILABLE_ON]->(p:Platform)
                 OPTIONAL MATCH (g)-[:DEVELOPED_BY]->(d:Company)
                 OPTIONAL MATCH (g)-[:PUBLISHED_BY]->(j:Company)
                 OPTIONAL MATCH (g)-[:IS_PART_OF]->(s:Serie)
                 OPTIONAL MATCH (g)-[:IS_RATED]->(r:Rating)
                 OPTIONAL MATCH (g)-[:POWERED_BY]->(e:GameEngine)
                 OPTIONAL MATCH (g)-[:BELONGS_TO]->(c:Genre)
                 OPTIONAL MATCH (g)-[:SHOWCASES]->(t:Franchise)
                 OPTIONAL MATCH (g)-[:SIMILAR_TO]->(k:Game)
                 RETURN g, collect(DISTINCT p) as platforms, collect(DISTINCT d) as developers, collect(DISTINCT j) as publishers, collect(DISTINCT s) as series, collect(DISTINCT r) as ratings, collect(DISTINCT e) as engines, collect(DISTINCT c) as genres, collect(DISTINCT t) as franchises, collect(DISTINCT k) as similarGames`,
                { gameId }
            );

            var gameData = result.records.map(record => {
                const game = record.get('g').properties;
                game.platforms = record.get('platforms').map(platform => platform.properties);
                game.developers = record.get('developers').map(developer => developer.properties);
                game.publishers = record.get('publishers').map(publisher => publisher.properties);
                game.series = record.get('series').map(serie => serie.properties);
                game.ratings = record.get('ratings').map(rating => rating.properties);
                game.engines = record.get('engines').map(engine => engine.properties);
                game.genres = record.get('genres').map(genre => genre.properties);
                game.franchises = record.get('franchises').map(franchise => franchise.properties);
                game.similarGames = record.get('similarGames').map(similarGame => similarGame.properties);
                return game;
            });

            if (!gameData || gameData.length === 0) {
                res.status(404).json({ error: 'Jeu non trouvé' });
                return;
            }

            res.status(200).json(gameData[0]);
        }
    },
    search: {
        validation: {
            body: Joi.object({
                query: Joi.string().required(),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
                page: Joi.number().integer().min(1).default(1),
            }),
        },
        route: async (req, res) => {
            try {
                const query = req.body.query.toLowerCase();
                const maxResults = req.body.maxResults || 10;
                const page = req.body.page || 1;
                const skip = (page - 1) * maxResults;

                const countResult = await db.cypher(`
                    MATCH (g:Game) 
                    WHERE toLower(g.title) CONTAINS $query 
                    RETURN count(g) AS total
                    `, { query }
                );

                const gameCount = countResult.records.length > 0 ? countResult.records[0].get('total').low : 0;

                const resultGames = await db.cypher(`
                    MATCH (g:Game) 
                    WHERE toLower(g.title) CONTAINS $query 
                    RETURN g 
                    ORDER BY g.title 
                    SKIP ${skip} LIMIT ${maxResults}
                    `, { query }
                );

                const gamesArray = resultGames.records.map(record => record.get('g').properties);

                res.status(200).json({ gamesArray, gameCount });

            } catch (error) {
                console.error('Erreur Neo4j:', error);
                res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
            }
        }
    },
    popular: {
        validation: {
            body: Joi.object({
                maxResults: Joi.number().integer().min(1).max(100).default(10),
                page: Joi.number().integer().min(1).default(1),
            }),
        },
        route: async (req, res) => {
            try {
                const maxResults = req.body.maxResults || 10;
                const page = req.body.page || 1;
                const skip = (page - 1) * maxResults;

                // Récupérer le nombre total de jeux possédés
                const countResult = await db.cypher(`
                MATCH (g:Game)<-[r:OWNS]-(:User)
                RETURN count(DISTINCT g) AS total
            `);

                const gameCount = countResult.records.length > 0 ? countResult.records[0].get('total').low : 0;

                // Récupérer les jeux avec le plus de relations OWNS
                const resultGames = await db.cypher(`
                MATCH (g:Game)<-[r:OWNS]-(:User)
                RETURN g, count(r) AS ownershipCount
                ORDER BY ownershipCount DESC
                SKIP ${skip} LIMIT ${maxResults}
            `);

                const gamesArray = resultGames.records.map(record => ({
                    ...record.get('g').properties,
                    ownershipCount: record.get('ownershipCount').low, // Ajout du nombre de propriétaires
                }));

                res.status(200).json({ gamesArray, gameCount });
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux populaires:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux populaires" });
            }
        }
    }
};