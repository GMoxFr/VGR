module.exports = async function (instance) {
    console.log("Running migration: 250127000-create-Game");

    try {
        // Création d'un nœud Game avec l'ID le plus bas possible
        await instance.writeCypher(`
            MERGE (g:Game {id: '00000000-0000-0000-0000-000000000001', title: 'Example Game'})
        `);

        // Ajout d'un enregistrement de la migration dans la base de données
        await instance.writeCypher(`
            MERGE (m:Migration { version: "250127000" })
            ON CREATE SET m.appliedAt = datetime()
        `);

        console.log("Migration 250127000-create-Game applied successfully.");
    } catch (error) {
        console.error("Error applying migration 250127000-create-Game:", error);
    }
};
