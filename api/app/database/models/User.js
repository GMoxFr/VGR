// Model for the User node in the database
// models/User.js

module.exports = {
    id: { type: 'uuid', primary: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true },
    email: { type: 'string', required: false },
    token: { type: 'string', required: false },
    created_at: { type: 'datetime', default: () => new Date() },
    updated_at: { type: 'datetime', default: () => new Date() },

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

    owns: {
        type: 'relationship',
        target: 'Game',
        relationship: 'OWNS',
        direction: 'out',
        eager: true,
    },
}