const Joi = require('joi');
const db = require("@db");

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

            const game = await db.first("Game", { igdb_id: gameId });

            if (!game) {
                res.status(404).json({ error: 'Jeu non trouvé' });
                return;
            }

            res.status(200).json(game.properties());
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

                const countResult = await db.cypher(
                    `MATCH (g:Game) 
                    WHERE toLower(g.title) CONTAINS $query 
                    RETURN count(g) AS total`,
                    { query }
                );

                const gameCount = countResult.records.length > 0 ? countResult.records[0].get('total').low : 0;

                const resultGames = await db.cypher(
                    `MATCH (g:Game) 
                    WHERE toLower(g.title) CONTAINS $query 
                    RETURN g 
                    ORDER BY g.title 
                    SKIP ${skip} LIMIT ${maxResults}`,
                    { query }
                );

                const gamesArray = resultGames.records.map(record => record.get('g').properties);

                res.status(200).json({ gamesArray, gameCount });

            } catch (error) {
                console.error('Erreur Neo4j:', error);
                res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
            }
        }
    }
};