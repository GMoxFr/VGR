const express = require('express');
const Neode = require("neode");
const multer = require('multer');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const cors = require('cors');

const db = new Neode.fromEnv();
const app = express();
const upload = multer({ dest: 'uploads/' });

// Définition des modèles simplifiés
db.model('User', {
    id: { type: 'uuid', primary: true },
    username: { type: 'string', required: true, index: true },
    token: { type: 'string', required: false },
    owns: {
        type: 'relationship',
        target: 'Game',
        relationship: 'OWNS',
        direction: 'out',
        eager: true,
    },
});

db.model('Game', {
    igdb_id: { type: 'number', primary: true },
    title: { type: 'string', required: true },
});

app.use(cors());

// Middleware d'authentification
app.use(async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    const user = await db.first("User", { token });

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
});

// Route d'import CSV
app.post('/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni.' });
    }

    try {
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const records = parse(fileContent, { columns: true });

        const user = req.user;

        for (const record of records) {
            const gameId = parseInt(record.igdb_id);
            const title = record.title || '';

            let game = await db.first("Game", { igdb_id: gameId });

            if (!game) {
                continue; // Skip if the game is not found
            }

            await user.relateTo(game, "owns", {});
        }

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'Import réussi' });
    } catch (error) {
        console.error("Erreur lors de l'import :", error);
        res.status(500).json({ error: "Erreur serveur lors de l'import" });
    }
});

app.listen(8004, () => {
    console.log(`Server is running on port 8004`);
});