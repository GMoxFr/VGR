// Model for the Rating node in the database
// models/Rating.js

module.exports = {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },
    category_id: { type: 'number', required: false },
    rating_id: { type: 'number', required: false },
    category: { type: 'string', required: false },
    rating: { type: 'string', required: false },

    rated: {
        type: 'relationship',
        target: 'Game',
        relationship: 'IS_RATED',
        direction: 'out',
    },
}