const Joi = require('joi');
const db = require("@db");

module.exports = {
    get: {
        validation: {
            body: Joi.object({
            }),
        },
        route: async (req, res) => {
            const userInfos = req.user;

            const user = {};
            user.username = userInfos.get("username");

            res.status(200).json(user);
        }
    }
};