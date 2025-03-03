const Joi = require('joi');
const db = require("@db");

module.exports = {
    add: {
        validation: {
            params: Joi.object({
                gameId: Joi.number().integer().required(),
            }),
        },
        route: async (req, res) => {
            const userInfos = req.user;
            const gameId = Number(req.params.gameId);

            const game = await db.first("Game", { igdb_id: gameId });

            if (!game) {
                res.status(404).json({ error: 'Jeu non trouvé' });
                return;
            }

            const owns = await userInfos.relateTo(game, "owns", {});

            res.status(200).json({ success: true });
        }
    },
    remove: {
        validation: {
            params: Joi.object({
                gameId: Joi.number().integer().required(),
            }),
        },
        route: async (req, res) => {
            try {
                const userInfos = req.user; // Utilisateur authentifié
                const gameId = Number(req.params.gameId);

                if (isNaN(gameId)) {
                    return res.status(400).json({ error: "gameId doit être un entier valide" });
                }

                const game = await db.first("Game", { igdb_id: gameId });

                if (!game) {
                    return res.status(404).json({ error: "Jeu non trouvé" });
                }

                // 🔥 Supprimer la relation `owns` entre l'utilisateur et le jeu
                const removed = await userInfos.detachFrom(game, "owns");

                if (!removed) {
                    return res.status(400).json({ error: "La relation n'existe pas ou n'a pas été supprimée" });
                }

                res.status(200).json({ success: true });

            } catch (error) {
                console.error("Erreur lors de la suppression du jeu possédé:", error);
                res.status(500).json({ error: "Erreur serveur lors de la suppression du jeu" });
            }
        }
    },
    owned: {
        validation: {
            params: Joi.object({
                gameId: Joi.number().integer().required(),
            }),
        },
        route: async (req, res) => {
            try {
                const userId = req.user.get('id');
                const gameId = Number(req.params.gameId);

                if (isNaN(gameId)) {
                    return res.status(400).json({ error: "gameId doit être un entier valide" });
                }

                // 🔥 Vérifier si la relation `owns` existe
                const result = await db.cypher(
                    `MATCH (u:User {id: $userId})-[r:OWNS]->(g:Game {igdb_id: $gameId}) 
                    RETURN count(r) AS count`,
                    { userId, gameId }
                );

                const ownsGame = result.records.length > 0 && result.records[0].get('count') > 0;

                res.status(200).json({ owned: ownsGame });

            } catch (error) {
                console.error("Erreur lors de la vérification du jeu possédé:", error);
                res.status(500).json({ error: "Erreur serveur lors de la vérification du jeu" });
            }
        }
    },
    myGames: {
        validation: {
            body: Joi.object({
                maxResults: Joi.number().integer().min(1).max(100).default(10),
                page: Joi.number().integer().min(1).default(1),
            }),
        },
        route: async (req, res) => {
            try {
                const userInfos = req.user;
                const username = userInfos.get('username');

                const maxResults = req.body.maxResults || 10;
                const page = req.body.page || 1;
                const skip = (page - 1) * maxResults;

                const countResult = await db.cypher(`
                MATCH (u:User {username: $username})-[:OWNS]->(g:Game)
                RETURN count(g) AS total
                `, { username }
                );

                const gameCount = countResult.records.length > 0 ? countResult.records[0].get('total').low : 0;

                const resultGames = await db.cypher(`
                MATCH (u:User {username: $username})-[:OWNS]->(g:Game)
                RETURN g
                ORDER BY g.title
                SKIP ${skip} LIMIT ${maxResults}
                `, { username }
                );

                const gamesArray = resultGames.records.map(record => record.get('g').properties);

                res.status(200).json({ gamesArray, gameCount });
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux possédés:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux" });
            }
        }
    },
    games: {
        validation: {
            body: Joi.object({
                maxResults: Joi.number().integer().min(1).max(100).default(10),
                page: Joi.number().integer().min(1).default(1),
            }),
            params: Joi.object({
                username: Joi.string().required(),
            }),
        },
        route: async (req, res) => {
            try {
                const username = req.params.username;

                const maxResults = req.body.maxResults || 10;
                const page = req.body.page || 1;
                const skip = (page - 1) * maxResults;

                // 🔥 Récupérer les jeux possédés par l'utilisateur
                const countResult = await db.cypher(`
                MATCH (u:User {username: $username})-[:OWNS]->(g:Game)
                RETURN count(g) AS total
                `, { username }
                );

                const gameCount = countResult.records.length > 0 ? countResult.records[0].get('total').low : 0;

                const resultGames = await db.cypher(`
                MATCH (u:User {username: $username})-[:OWNS]->(g:Game)
                RETURN g
                ORDER BY g.title
                SKIP ${skip} LIMIT ${maxResults}
                `, { username }
                );

                const gamesArray = resultGames.records.map(record => record.get('g').properties);

                res.status(200).json({ gamesArray, gameCount });
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux possédés:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux" });
            }
        }
    },
};