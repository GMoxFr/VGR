const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                ratingId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const ratingId = Number(req.params.ratingId);
                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                // Récupérer la note
                const ratingResult = await db.cypher(
                    `MATCH (rating:Rating {id: $ratingId})
                     RETURN rating`,
                    { ratingId }
                );

                if (ratingResult.records.length === 0) {
                    return res.status(404).json({ error: "Note non trouvée" });
                }

                const rating = ratingResult.records[0].get("rating").properties;

                // Compter le nombre total de jeux avec cette note
                const gameCountResult = await db.cypher(
                    `MATCH (game:Game)-[:IS_RATED]->(rating:Rating {id: $ratingId})
                     RETURN COUNT(game) AS count`,
                    { ratingId }
                );

                rating.totalGames = gameCountResult.records.length > 0 ? gameCountResult.records[0].get('count').low : 0;

                // Récupérer les jeux avec cette note avec pagination
                const result = await db.cypher(
                    `MATCH (game:Game)-[:IS_RATED]->(rating:Rating {id: $ratingId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { ratingId }
                );

                rating.games = result.records.map(record => record.get('game').properties);

                res.json(rating);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux avec cette note:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux avec cette note" });
            }
        }
    }
};