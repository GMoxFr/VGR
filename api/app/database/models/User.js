// Model for the User node in the database
// models/User.js

module.exports = {
    id: { type: 'uuid', primary: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true },

    rated: {
        type: 'relationship',
        target: 'Game',
        relationship: 'RATED',
        direction: 'out',
        properties: {
            rating: { type: 'number', required: true },
            comment: { type: 'string', required: false },
        },
    },
}