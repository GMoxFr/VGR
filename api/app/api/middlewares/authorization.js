const db = require("@db");

module.exports = function middleware() {
    return async function middleware(req, res, next) {
        if (!req.headers.authorization ||
            req.headers.authorization === '' ||
            req.headers.authorization === undefined ||
            req.headers.authorization === null) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = (req.headers.authorization).replace('Bearer ', '');

        const user = await db.first("User", { token });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        next();
    }
}