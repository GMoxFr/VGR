module.exports = async function (instance) {
    console.log("Running migration: 250127000-create-Game");

    try {
        await instance.create("Game", {
            title: "Overwatch 2",
        });

        console.log("Migration 250127000-create-Game applied successfully.");
    } catch (error) {
        console.error("Error applying migration 250127000-create-Game:", error);
    }
};
