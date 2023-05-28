const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
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

noteSchema.statics.isValid = function(note, checkForRequired = true) {
    var err = { 
        status: 200,
        clientMsg: "Invalid Note", 
        message: "User tried to create note "
    };

    if(!note.title && checkForRequired) {
        err.message += "without title";
        return [false, err];
    }
    if(note.title && note.title.trim() === "") {
        err.message += "with invalid title";
        return [false, err];
    }
    if(note.publish && typeof note.publish !== "boolean") {
        err.message += "with not a boolean publish value";
        err.value = note.publish;
        return [false, err];
    }
    
    return [true, null];
}

var NoteModel = mongoose.model('Note', noteSchema);
module.exports = NoteModel;