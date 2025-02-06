const express = require('express');
const router = express.Router();
const { validate } = require('express-validation');

const authorization = require('./middlewares/authorization');

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
router.get('/games', authorization(), validate(games.list.validation), trycatch(games.list.route));
// router.get('/games/:gameId', validate(games.get.validation), trycatch(games.get.route));

const auth = require('./controllers/auth');
router.post('/auth/signup', validate(auth.signup.validation), trycatch(auth.signup.route));
router.post('/auth/signin', validate(auth.signin.validation), trycatch(auth.signin.route));

const profile = require('./controllers/profile');
router.get('/profile', authorization(), validate(profile.get.validation), trycatch(profile.get.route));

module.exports = router;