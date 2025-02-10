// Model for the Game node in the database
// models/Game.js

module.exports = {
    igdb_id: { type: 'number', primary: true },
    title: { type: 'string', required: true },
    release_date: { type: 'number', required: false },
    cover_image_id: { type: 'string', required: false },
    storyline: { type: 'string', required: false },
    summary: { type: 'string', required: false },

    available_on: {
        type: 'relationship',
        target: 'Platform',
        relationship: 'AVAILABLE_ON',
        direction: 'out',
    },

    belongs_to: {
        type: 'relationship',
        target: 'Genre',
        relationship: 'BELONGS_TO',
        direction: 'out',
    },

    developed_by: {
        type: 'relationship',
        target: 'Company',
        relationship: 'DEVELOPED_BY',
        direction: 'out',
    },

    published_by: {
        type: 'relationship',
        target: 'Company',
        relationship: 'PUBLISHED_BY',
        direction: 'out',
    },

    is_rated: {
        type: 'relationship',
        target: 'Rating',
        relationship: 'IS_RATED',
        direction: 'out',
    },

    powered_by: {
        type: 'relationship',
        target: 'GameEngine',
        relationship: 'POWERED_BY',
        direction: 'out',
    },

    has_keyword: {
        type: 'relationship',
        target: 'Keyword',
        relationship: 'HAS_KEYWORD',
        direction: 'out',
    },

    is_part_of: {
        type: 'relationship',
        target: 'Serie',
        relationship: 'IS_PART_OF',
        direction: 'out',
    },

    showcases: {
        type: 'relationship',
        target: 'Franchise',
        relationship: 'SHOWCASES',
        direction: 'out',
    }
}