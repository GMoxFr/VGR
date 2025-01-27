module.exports = async function (instance) {
    console.log("Running migration: 250127001-create-User");

    try {
        // Création d'un nœud User avec l'ID le plus bas possible
        await instance.writeCypher(`
            MERGE (u:User {id: '00000000-0000-0000-0000-000000000001', username: 'test_user', password: 'password123'})
        `);

        // Création d'une relation PLAYED entre User et Game avec des valeurs factices
        await instance.writeCypher(`
            MATCH (u:User {id: '00000000-0000-0000-0000-000000000001'}),
                  (g:Game {id: '00000000-0000-0000-0000-000000000001'})
            MERGE (u)-[:PLAYED {rating: 5, comment: 'Great game!'}]->(g)
        `);

        // Ajout d'un enregistrement de la migration dans la base de données
        await instance.writeCypher(`
            MERGE (m:Migration { version: "250127001" })
            ON CREATE SET m.appliedAt = datetime()
        `);

        console.log("Migration 250127001-create-User applied successfully.");
    } catch (error) {
        console.error("Error applying migration 250127001-create-User:", error);
    }
};
