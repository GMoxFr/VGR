const express = require('express');
const Neode = require("neode");
const { Parser } = require('json2csv');
const cors = require('cors');

const db = new Neode.fromEnv();

const app = express();

app.use(cors());

app.get('/export/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const result = await db.cypher(`
            MATCH (u:User {username: $username})-[:OWNS]->(g:Game)
            RETURN g
        `, { username });

        const gamesArray = result.records.map(record => record.get('g').properties);

        for (const game of gamesArray)
            game.igdb_id = parseInt(game.igdb_id);

        const csvParser = new Parser({ fields: ['igdb_id', 'title'] });
        const csv = csvParser.parse(gamesArray);

        res.header({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename=${username}_games.csv`,
        });
        res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting games:", error);
        res.status(500).json({ error: "Server error while exporting games" });
    }
});

app.listen(8003, () => {
    console.log(`Server is running on port 8003`);
});