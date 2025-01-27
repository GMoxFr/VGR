// Model for the Game node in the database
// models/Game.js

module.exports = {
    id: { type: 'uuid', primary: true },
    title: { type: 'string', required: true },
}