// Model for the Serie node in the database
// models/Serie.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    has_game: {
        type: 'relationship',
        target: 'Game',
        relationship: 'IS_PART_OF',
        direction: 'out',
        eager: true,
    },
}