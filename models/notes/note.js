const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = require('./comment');

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
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments : [ commentSchema ]
}, {
    timestamps: true
});

var NoteModel = mongoose.model('Note', noteSchema);
module.exports = NoteModel;