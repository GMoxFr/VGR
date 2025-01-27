require("module-alias/register");

const Neode = require("neode");
const fs = require("fs");
const path = require("path");

const instance = new Neode.fromEnv();

async function migrate() {
    console.log("Starting migrations...");

    // Créer le nœud racine de migration s'il n'existe pas
    await instance.writeCypher(`
        MERGE (m:MigrationRoot { initialized: true })
        ON CREATE SET m.createdAt = datetime()
    `);

    const migrationPath = path.join(__dirname, "../app/database/migrations");

    if (!fs.existsSync(migrationPath)) {
        console.error("Migration directory does not exist:", migrationPath);
        process.exit(1);
    }

    const files = fs.readdirSync(migrationPath);

    for (const file of files) {
        const migrationVersion = file.split("-")[0]; // Extraction du numéro de version

        const result = await instance.cypher(`
            MATCH (m:Migration { version: "${migrationVersion}" })
            RETURN m
        `);

        if (result.records.length === 0) {
            console.log(`Applying migration: ${file}`);
            const migration = require(`@database/migrations/${file}`);
            await migration(instance);  // Passe l'instance à la migration
        } else {
            console.log(`Migration ${file} already applied.`);
        }
    }

    console.log("All migrations applied successfully.");
    process.exit();
}

migrate();