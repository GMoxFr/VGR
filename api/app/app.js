const express = require('express');
const cors = require('cors');

const { logger, logRequest } = require('@utils/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logRequest);

const apiRouter = require('@router');
apiRouter(app);

module.exports = app;