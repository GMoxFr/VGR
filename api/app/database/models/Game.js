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
        eager: true,
    },

    belongs_to: {
        type: 'relationship',
        target: 'Genre',
        relationship: 'BELONGS_TO',
        direction: 'out',
        eager: true,
    },

    developed_by: {
        type: 'relationship',
        target: 'Company',
        relationship: 'DEVELOPED_BY',
        direction: 'out',
        eager: true,
    },

    published_by: {
        type: 'relationship',
        target: 'Company',
        relationship: 'PUBLISHED_BY',
        direction: 'out',
        eager: true,
    },

    is_rated: {
        type: 'relationship',
        target: 'Rating',
        relationship: 'IS_RATED',
        direction: 'out',
        eager: true,
    },

    powered_by: {
        type: 'relationship',
        target: 'GameEngine',
        relationship: 'POWERED_BY',
        direction: 'out',
        eager: true,
    },

    has_keyword: {
        type: 'relationship',
        target: 'Keyword',
        relationship: 'HAS_KEYWORD',
        direction: 'out',
        eager: true,
    },

    is_part_of: {
        type: 'relationship',
        target: 'Serie',
        relationship: 'IS_PART_OF',
        direction: 'out',
        eager: true,
    },

    showcases: {
        type: 'relationship',
        target: 'Franchise',
        relationship: 'SHOWCASES',
        direction: 'out',
        eager: true,
    }
}