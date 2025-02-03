require("module-alias/register");

const Neode = require("neode");
const fs = require("fs");
const path = require("path");

const instance = new Neode.fromEnv().withDirectory(__dirname + "/../app/database/models");

async function migrate() {
    console.log("Starting migrations...");

    const migrationPath = path.join(__dirname, "../app/database/migrations");

    if (!fs.existsSync(migrationPath)) {
        console.error("Migration directory does not exist:", migrationPath);
        process.exit(1);
    }

    const files = fs.readdirSync(migrationPath);

    for (const file of files) {
        console.log(`Applying migration: ${file}`);
        const migration = require(`@database/migrations/${file}`);
        await migration(instance);
    }

    console.log("All migrations applied successfully.");
    process.exit();
}

migrate();