// import winston from 'winston';
// import chalk from 'chalk';
const winston = require('winston');
const chalkModule = require('chalk');
const chalk = chalkModule.default;

// Définition des couleurs pour chaque niveau de log
const customColors = {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'magenta',
    debug: 'green'
};

// Ajout des couleurs à Winston
winston.addColors(customColors);

// Définition des couleurs pour les requêtes HTTP
const methodColors = {
    GET: chalk.green,
    POST: chalk.blue,
    PUT: chalk.yellow,
    DELETE: chalk.red,
    PATCH: chalk.magenta
};

// Définition des couleurs pour les statuts HTTP
const statusColors = (status) => {
    if (status >= 500) return chalk.red(status); // Erreurs Serveur (500+)
    if (status >= 400) return chalk.yellow(status); // Erreurs Client (400+)
    if (status >= 300) return chalk.cyan(status); // Redirections (300+)
    return chalk.green(status); // Succès (200+)
};

// Format des logs avec couleurs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        const levelColor = winston.format.colorize().colorize(level, level.toUpperCase());
        return `[${timestamp}] ${levelColor}: ${message}`;
    })
);

// Création du logger
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console(), // Affichage en console avec couleurs
    ]
});

// Middleware pour loguer les requêtes HTTP
const logRequest = (req, res, next) => {
    res.on('finish', () => {
        const method = methodColors[req.method] ? methodColors[req.method](req.method.padEnd(6)) : chalk.white(req.method);
        const status = statusColors(res.statusCode.toString().padEnd(5));
        logger.info(`${method} ${status} ${req.url}`);
    });

    next();
};

module.exports = { logger, logRequest };