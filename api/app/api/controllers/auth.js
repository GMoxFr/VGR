const Joi = require('joi');
const db = require("@db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

module.exports = {
    signup: {
        validation: {
            body: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required(),
                passwordConfirm: Joi.string().required(),
            }),
        },
        route: async (req, res) => {
            const username = req.body.username;
            const password = req.body.password;
            const passwordConfirm = req.body.passwordConfirm;

            if (password !== passwordConfirm) {
                return res.status(400).json({ error: "Passwords do not match" });
            }

            const user = await db.first("User", { username });

            if (user) {
                return res.status(409).json({ error: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const createdUser = await db.create("User", { username, password: hashedPassword });

            const timestamp = (new Date()).valueOf().toString();
            const random = crypto.randomBytes(256).toString();
            const token = crypto.createHash('sha256').update(`${username}${timestamp}${random}`).digest('hex');

            await createdUser.update({ token });

            res.status(201).json({ token });
        }
    },
    signin: {
        validation: {
            body: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required(),
            }),
        },
        route: async (req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            const user = await db.first("User", { username });            

            if (!user) {
                return res.status(401).json({ error: "Username or password is incorrect" });
            }

            if (!(await bcrypt.compare(password, user.get("password")))) {
                return res.status(401).json({ error: "Username or password is incorrect" });
            }

            if (!user.get("token")) {
                const timestamp = (new Date()).valueOf().toString();
                const random = crypto.randomBytes(256).toString();
                const token = crypto.createHash('sha256').update(`${username}${timestamp}${random}`).digest('hex');

                await user.update({ token });
            }

            res.status(200).json({ token: user.get("token") });
        }
    }
};