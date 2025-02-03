const Neode = require("neode");

const db = new Neode.fromEnv().withDirectory(__dirname + "/database/models");

module.exports = db;