const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    }, 
    content: {
        type: String,
        default: ''
    },
    publish: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

var NoteModel = mongoose.model('Note', noteSchema);
module.exports = NoteModel;