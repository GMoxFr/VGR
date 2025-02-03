const bcrypt = require("bcrypt");

module.exports = async function (instance) {
    console.log("Running migration: 250127001-create-User");

    try {
        const user = await instance.create("User", {
            username: "Soon",
            password: await bcrypt.hash("password", 10),
        });

        const game = await instance.first("Game", { title: "Overwatch 2" });

        await user.relateTo(game, "played", { rating: 4, comment: "Fun game!" });

        console.log("Migration 250127001-create-User applied successfully.");
    } catch (error) {
        console.error("Error applying migration 250127001-create-User:", error);
    }
};
