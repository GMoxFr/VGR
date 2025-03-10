const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                gameEngineId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const gameEngineId = Number(req.params.gameEngineId);
                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                // Récupérer le moteur de jeu
                const gameEngineResult = await db.cypher(
                    `MATCH (engine:GameEngine {id: $gameEngineId})
                     RETURN engine`,
                    { gameEngineId }
                );

                if (gameEngineResult.records.length === 0) {
                    return res.status(404).json({ error: "Moteur de jeu non trouvé" });
                }

                const gameEngine = gameEngineResult.records[0].get("engine").properties;

                // Compter le nombre total de jeux utilisant ce moteur
                const gameCountResult = await db.cypher(
                    `MATCH (game:Game)-[:POWERED_BY]->(engine:GameEngine {id: $gameEngineId})
                     RETURN COUNT(game) AS count`,
                    { gameEngineId }
                );

                gameEngine.totalGames = gameCountResult.records.length > 0 ? gameCountResult.records[0].get('count').low : 0;

                // Récupérer les jeux utilisant ce moteur avec pagination
                const result = await db.cypher(
                    `MATCH (game:Game)-[:POWERED_BY]->(engine:GameEngine {id: $gameEngineId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { gameEngineId }
                );

                gameEngine.games = result.records.map(record => record.get('game').properties);

                res.json(gameEngine);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux utilisant le moteur de jeu:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux utilisant le moteur de jeu" });
            }
        }
    }
};