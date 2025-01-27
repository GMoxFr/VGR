const Neode = require("neode");

const db = new Neode.fromEnv().withDirectory("@database/models");

module.exports = db;