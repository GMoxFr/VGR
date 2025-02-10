// Model for the Platform node in the database
// models/Platform.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },

    available_on: {
        type: 'relationship',
        target: 'Game',
        relationship: 'AVAILABLE_ON',
        direction: 'out',
    },
}