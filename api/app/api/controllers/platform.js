const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                platformId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const platformId = Number(req.params.platformId);

                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                // Récupérer la plateforme
                const platformResult = await db.cypher(
                    `MATCH (platform:Platform {id: $platformId})
                     RETURN platform`,
                    { platformId }
                );

                if (platformResult.records.length === 0) {
                    return res.status(404).json({ error: "Plateforme non trouvée" });
                }

                const platform = platformResult.records[0].get("platform").properties;

                // Compter le nombre total de jeux sur cette plateforme
                const gameCountResult = await db.cypher(
                    `MATCH (game:Game)-[:AVAILABLE_ON]->(platform:Platform {id: $platformId})
                     RETURN COUNT(game) AS count`,
                    { platformId }
                );

                platform.totalGames = gameCountResult.records.length > 0 ? gameCountResult.records[0].get('count').low : 0;

                // Récupérer les jeux associés à la plateforme avec pagination
                const result = await db.cypher(
                    `MATCH (game:Game)-[:AVAILABLE_ON]->(platform:Platform {id: $platformId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { platformId }
                );

                platform.games = result.records.map(record => record.get('game').properties);

                res.json(platform);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux de la plateforme:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux de la plateforme" });
            }
        }
    }
};