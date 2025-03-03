// Model for the Franchise node in the database
// models/Franchise.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    has_game: {
        type: 'relationship',
        target: 'Game',
        relationship: 'SHOWCASES',
        direction: 'out',
        eager: true,
    },
}