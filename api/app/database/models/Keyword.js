// Model for the Keyword node in the database
// models/Keyword.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    has_game: {
        type: 'relationship',
        target: 'Game',
        relationship: 'HAS_KEYWORD',
        direction: 'out',
        eager: true,
    },
}