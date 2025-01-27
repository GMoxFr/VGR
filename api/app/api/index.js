const express = require('express');
const router = express.Router();
const { validate } = require('express-validation');

function trycatch(methods, ...args) {
	return async (req, res, next) => {
		try {
			await methods(req, res, next, ...args);
		} catch (error) {
			next(error);
		}
	};
}

// Games Route
const games = require('./controllers/games');
router.get('/games', validate(games.list.validation), trycatch(games.list.route));
router.get('/games/:gameId', validate(games.get.validation), trycatch(games.get.route));

module.exports = router;