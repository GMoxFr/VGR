const Joi = require('joi');
const db = require("@db");

module.exports = {
	list: {
		validation: {
			body: Joi.object({
			}),
		},
        route: async (req, res) => {
            const games = await db.all("Game");

            gamesArray = [];
            gamesCount = games.length;
            for (let i = 0; i < gamesCount; i++) {
                gamesArray.push(games.get(i).properties());
            }

            res.status(200).json(gamesArray);
		}
	},
	get: {
		validation: {
			params: Joi.object({
				gameId: Joi.string().required(),
			}),
		},
		route: async (req, res) => {
            res.status(200).json({ placeholder: "It works!" });
		}
	}
};