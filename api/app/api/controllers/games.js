const Joi = require('joi');

module.exports = {
	list: {
		validation: {
			body: Joi.object({
			}),
		},
        route: async (req, res) => {
            placeholder = "It works!";

			res.status(200).json({ placeholder });
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