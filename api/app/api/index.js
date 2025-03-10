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
router.post('/games/search', validate(games.search.validation), trycatch(games.search.route));
router.get('/games/:gameId', validate(games.get.validation), trycatch(games.get.route));
router.post('/games/popular', validate(games.popular.validation), trycatch(games.popular.route));

const auth = require('./controllers/auth');
router.post('/auth/signup', validate(auth.signup.validation), trycatch(auth.signup.route));
router.post('/auth/signin', validate(auth.signin.validation), trycatch(auth.signin.route));

const profile = require('./controllers/profile');
router.get('/profile', authorization(), validate(profile.get.validation), trycatch(profile.get.route));
router.delete('/profile', authorization(), validate(profile.delete.validation), trycatch(profile.delete.route));

const library = require('./controllers/library');
router.post('/library/add/:gameId', authorization(), validate(library.add.validation), trycatch(library.add.route));
router.delete('/library/add/:gameId', authorization(), validate(library.remove.validation), trycatch(library.remove.route));
router.get('/library/add/:gameId', authorization(), validate(library.owned.validation), trycatch(library.owned.route));
router.post('/library/list', authorization(), validate(library.myGames.validation), trycatch(library.myGames.route));
router.post('/library/list/:username', validate(library.games.validation), trycatch(library.games.route));

const company = require('./controllers/company');
router.get('/company/:companyId', validate(company.get.validation), trycatch(company.get.route));

const genre = require('./controllers/genre');
router.get('/genre/:genreId', validate(genre.get.validation), trycatch(genre.get.route));

const platform = require('./controllers/platform');
router.get('/platform/:platformId', validate(platform.get.validation), trycatch(platform.get.route));

const serie = require('./controllers/serie');
router.get('/series/:serieId', validate(serie.get.validation), trycatch(serie.get.route));

const franchise = require('./controllers/franchise');
router.get('/franchises/:franchiseId', validate(franchise.get.validation), trycatch(franchise.get.route));

const gameEngine = require('./controllers/gameEngine');
router.get('/engines/:gameEngineId', validate(gameEngine.get.validation), trycatch(gameEngine.get.route));

const rating = require('./controllers/rating');
router.get('/ratings/:ratingId', validate(rating.get.validation), trycatch(rating.get.route));

module.exports = router;