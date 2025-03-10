const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                franchiseId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const franchiseId = Number(req.params.franchiseId);
                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                // Récupérer la franchise
                const franchiseResult = await db.cypher(
                    `MATCH (franchise:Franchise {id: $franchiseId})
                     RETURN franchise`,
                    { franchiseId }
                );

                if (franchiseResult.records.length === 0) {
                    return res.status(404).json({ error: "Franchise non trouvée" });
                }

                const franchise = franchiseResult.records[0].get("franchise").properties;

                // Compter le nombre total de jeux dans la franchise
                const gameCountResult = await db.cypher(
                    `MATCH (game:Game)-[:SHOWCASES]->(franchise:Franchise {id: $franchiseId})
                     RETURN COUNT(game) AS count`,
                    { franchiseId }
                );

                franchise.totalGames = gameCountResult.records.length > 0 ? gameCountResult.records[0].get('count').low : 0;

                // Récupérer les jeux associés à la franchise avec pagination
                const result = await db.cypher(
                    `MATCH (game:Game)-[:SHOWCASES]->(franchise:Franchise {id: $franchiseId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { franchiseId }
                );

                franchise.games = result.records.map(record => record.get('game').properties);

                res.json(franchise);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux de la franchise:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux de la franchise" });
            }
        }
    }
};