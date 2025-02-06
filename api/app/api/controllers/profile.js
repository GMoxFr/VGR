const Joi = require('joi');
const db = require("@db");
const { route } = require('../../app');

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
    },
    delete: {
        validation: {
            body: Joi.object({
            }),
        },
        route: async (req, res) => {
            const userInfos = req.user;

            await userInfos.delete();

            res.status(200).json({ success: true });
        }
    }
};