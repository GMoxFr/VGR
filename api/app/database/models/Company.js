// Model for the Company node in the database
// models/Company.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },
    country: { type: 'number', required: false },

    developed: {
        type: 'relationship',
        target: 'Game',
        relationship: 'DEVELOPED_BY',
        direction: 'in',
    },

    published: {
        type: 'relationship',
        target: 'Game',
        relationship: 'PUBLISHED_BY',
        direction: 'in',
    },
}