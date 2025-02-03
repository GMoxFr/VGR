// Model for the User node in the database
// models/User.js

module.exports = {
    id: { type: 'uuid', primary: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true },
    token: { type: 'string', required: false },
    createdAt: { type: 'datetime', default: () => new Date() },
    updatedAt: { type: 'datetime', default: () => new Date() },

    played: {
        type: 'relationship',
        target: 'Game',
        relationship: 'PLAYED',
        direction: 'out',
        properties: {
            rating: { type: 'number', required: false },
            comment: { type: 'string', required: false },
        },
    },
}