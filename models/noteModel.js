const ObjectId = require('mongoose').Types.ObjectId;
const NoteModel = require('./note');

function Note(note) {
    var Note = {}
    Note.title = note.title;
    Note.author = note.author;
    if('description' in note) Note.description = note.description;
    if('content' in note) Note.content = note.content;
    if('publish' in note) Note.publish = note.publish;
    return Note;
}

function isValid (note) {
    if(!note.title || !note.title.trim()) return false;
    return true;
}

function filterNotesAsNotLoggedUser (filter) {
    const filterForUnpublished = ('publish' in filter) && !filter.publish;
    if(filterForUnpublished) return Promise.resolve([]);

    filter.publish = true;

    return NoteModel.find(filter);
}

function filterNotesAsLoggedUser (filter, user) {
    const filterForUnpublished = ('publish' in filter) && !filter.publish;
    const filterForOtherAuthor = ('author' in filter) && filter.author !== user._id;

    if(filterForUnpublished) {
        if (filterForOtherAuthor) return Promise.resolve([]);
        else filter.author = user._id;
    }

    if(!('publish' in filter)) {
        if(filterForOtherAuthor) filter.publish = true;
        if(!('author' in filter)) {
            var filtera = { ...filter};
            var filterb = { ...filter};

            filtera.publish = true;
            
            filterb.publish = false;
            filterb.author = new ObjectId(user._id);

            filter = { $or: [ filtera, filterb ]};
        }
    }

    return NoteModel.find(filter);
}

module.exports.filterNotes = function (filter, user) {
    if(user) return filterNotesAsLoggedUser(filter, user);
    else return filterNotesAsNotLoggedUser(filter);
};

module.exports.createNote = function (data, user) {
    if (!isValid(data)) return new Promise.reject("Invalid Note");
    
    data.author = user._id;
    var note = Note(data);
    return NoteModel.create(note);
};

module.exports.findNoteById = function (id, user) {
    return NoteModel.findById(id).populate('author')
    .then(note => {
        if(note && ((user && note.author._id === user._id) || note.publish)) return Promise.resolve(note);
        else Promise.reject(new Error("Note does not exist or is not available"));
    });
}

module.exports.updateNote = function (noteId, updates, user) {
    return NoteModel.findOne({ _id: noteId }, 'author')
    .then(note => {
        if(note && note.author === user._id) return NoteModel.updateOne({ _id: noteId }, updates);
        else if(note && note.author !== user._id) return Promise.reject(new Error("Unauthorized operation"));
        else return Promise.reject(new Error("No note with given id was found"));
    });
}

module.exports.deleteNote = function (noteId, user) {
    return NoteModel.findOne({ _id: noteId }, 'author')
    .then(note => {
        if(note && note.author === user._id) return NoteModel.deleteOne({ _id: noteId });
        else if(note && note.author !== user._id) return Promise.reject(new Error("Unauthorized operation"));
        else return Promise.reject(new Error("No note with given id was found"));
    });
}