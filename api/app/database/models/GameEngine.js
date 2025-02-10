// Model for the GameEngine node in the database
// models/GameEngine.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    powering: {
        type: 'relationship',
        target: 'Game',
        relationship: 'POWERED_BY',
        direction: 'in',
    },
}