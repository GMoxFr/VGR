const Neode = require("neode");

// Initialiser la connexion à Neo4j via les variables d'environnement
const instance = new Neode.fromEnv();

async function cleanDatabase() {
    try {
        console.log("Starting database cleanup...");

        // Supprimer tous les nœuds et relations
        await instance.writeCypher(`
            MATCH (n) DETACH DELETE n
        `);
        console.log("All nodes and relationships deleted.");

        // Supprimer toutes les contraintes et index
        await instance.writeCypher(`
            CALL apoc.schema.assert({},{},true) YIELD label, key RETURN *
        `);
        console.log("All constraints and indexes removed.");

        console.log("Database cleanup completed successfully.");
    } catch (error) {
        console.error("Error during database cleanup:", error);
    } finally {
        process.exit();
    }
}

// Exécuter le nettoyage
cleanDatabase();
