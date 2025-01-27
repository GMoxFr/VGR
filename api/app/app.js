const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRouter = require('@router');
apiRouter(app);

module.exports = app;