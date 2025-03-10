const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                serieId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const serieId = Number(req.params.serieId);
                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                // Récupérer la série
                const serieResult = await db.cypher(
                    `MATCH (serie:Serie {id: $serieId})
                     RETURN serie`,
                    { serieId }
                );

                if (serieResult.records.length === 0) {
                    return res.status(404).json({ error: "Série non trouvée" });
                }

                const serie = serieResult.records[0].get("serie").properties;

                // Compter le nombre total de jeux dans la série
                const gameCountResult = await db.cypher(
                    `MATCH (game:Game)-[:IS_PART_OF]->(serie:Serie {id: $serieId})
                     RETURN COUNT(game) AS count`,
                    { serieId }
                );

                serie.totalGames = gameCountResult.records.length > 0 ? gameCountResult.records[0].get('count').low : 0;

                // Récupérer les jeux associés à la série avec pagination
                const result = await db.cypher(
                    `MATCH (game:Game)-[:IS_PART_OF]->(serie:Serie {id: $serieId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { serieId }
                );

                serie.games = result.records.map(record => record.get('game').properties);

                res.json(serie);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux de la série:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux de la série" });
            }
        }
    }
};