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
    },
    addToList: {
        validation: {
            body: Joi.object({
                gameId: Joi.number().integer().required(),
            }),
        },
        route: async (req, res) => {
            const userInfos = req.user;
            const gameId = req.body.gameId;

            const game = await db.first("Game", { igdb_id: gameId });

            if (!game) {
                res.status(404).json({ error: 'Jeu non trouvé' });
                return;
            }

            const owns = await userInfos.relateTo(game, "owns", {});

            res.status(200).json({ success: true });
        }
    },
};