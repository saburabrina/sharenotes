const NoteModel = require('./note');

function Note(note) {
    var Note = {}
    Note.title = note.title;
    if(description in note) Note.description = note.description;
    if(content in note) Note.content = note.content;
    if(publish in note) Note.publish = note.publish;
    return Note;
}

function isValid (note) {
    if(!note.title || !note.title.trim()) return false;
    return true;
}

module.exports.filterNotes = function (filter) {
    return NoteModel.find(filter);
};

module.exports.createNote = function (data) {
    if (!isValid(data)) return new Promise.reject("Invalid Note");
    
    var note = Note(data);
    return NoteModel.create(note);
};

module.exports.findNoteById = function (id) {
    return NoteModel.findById(id);
}

module.exports.updateNote = function (noteId, updates) {
    return NoteModel.findByIdAndUpdate(noteId, updates, { new: true });
}

module.exports.deleteNote = function (noteId) {
    return NoteModel.findByIdAndDelete(noteId);
}