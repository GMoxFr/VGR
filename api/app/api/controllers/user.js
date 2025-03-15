const Joi = require("joi");
const db = require("@db");

module.exports = {
    getAll: {
        validation: {
            body: Joi.object({}),
        },
        route: async (req, res) => {
            try {
                const result = await db.cypher(
                    `MATCH (user:User)
                     RETURN user`
                );

                const users = result.records.map(record => record.get('user').properties);

                res.json(users);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs:", error);
                res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs" });
            }
        }
    }
};