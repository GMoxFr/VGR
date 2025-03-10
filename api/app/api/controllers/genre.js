const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                genreId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                maxResults: Joi.number().integer().min(1).max(100).default(10),
            }),
        },
        route: async (req, res) => {
            try {
                const genreId = Number(req.params.genreId);

                const page = parseInt(req.query.page, 10) || 1;
                const maxResults = parseInt(req.query.maxResults, 10) || 15;
                const offset = (page - 1) * maxResults;

                const genreResult = await db.cypher(
                    `MATCH (genre:Genre {id: $genreId})
                     RETURN genre`,
                    { genreId }
                );

                if (genreResult.records.length === 0) {
                    return res.status(404).json({ error: "Genre non trouvé" });
                }

                const genre = genreResult.records[0].get("genre").properties;

                const gameCount = await db.cypher(
                    `MATCH (game:Game)-[:BELONGS_TO]->(genre:Genre {id: $genreId})
                     RETURN COUNT(game) AS count`,
                    { genreId }
                );

                genre.totalGames = gameCount.records.length > 0 ? gameCount.records[0].get('count').low : 0;

                const result = await db.cypher(
                    `MATCH (game:Game)-[:BELONGS_TO]->(genre:Genre {id: $genreId})
                     RETURN game
                     ORDER BY game.title
                     SKIP ${offset} LIMIT ${maxResults}`,
                    { genreId }
                );

                genre.games = result.records.map(record => record.get('game').properties);

                res.json(genre);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux du genre:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux du genre" });
            }
        }
    }
}