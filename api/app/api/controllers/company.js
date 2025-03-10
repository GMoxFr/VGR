const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            params: Joi.object({
                companyId: Joi.number().integer().required(),
            }),
            query: Joi.object({
                develop: Joi.boolean().default(false),
                publish: Joi.boolean().default(false),
            }),
        },
        route: async (req, res) => {
            try {
                const companyId = Number(req.params.companyId);
                const developAll = req.query.develop === "true";
                const publishAll = req.query.publish === "true";

                const result = await db.cypher(
                    `MATCH (c:Company {id: $companyId})
                    OPTIONAL MATCH (c)<-[:DEVELOPED_BY]-(g:Game)
                    WITH c, g ORDER BY g.title
                    WITH c, collect(DISTINCT g)[0..${developAll ? "" : "10"}] AS developedGames
                    OPTIONAL MATCH (c)<-[:PUBLISHED_BY]-(g2:Game)
                    WITH c, developedGames, g2 ORDER BY g2.title
                    RETURN c, developedGames, collect(DISTINCT g2)[0..${publishAll ? "" : "10"}] AS publishedGames`,
                    { companyId }
                );

                if (result.records.length === 0) {
                    return res.status(404).json({ error: "Société non trouvée" });
                }

                const record = result.records[0];
                const company = record.get("c").properties;
                company.developedGames = record.get("developedGames").map((game) => game.properties);
                company.publishedGames = record.get("publishedGames").map((game) => game.properties);

                res.status(200).json(company);
            } catch (error) {
                console.error("Erreur lors de la récupération des jeux de la société:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des jeux de la société" });
            }
        }
    }
}