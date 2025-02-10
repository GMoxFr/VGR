// Model for the Genre node in the database
// models/Genre.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    has_game: {
        type: 'relationship',
        target: 'Game',
        relationship: 'BELONGS_TO',
        direction: 'out',
    },
}