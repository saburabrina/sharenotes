const ObjectId = require('mongoose').Types.ObjectId;
const NoteModel = require('./note');

const errors = require('../lib/errors');

function Note(note) {
    var Note = {}
    Note.title = note.title;
    Note.description = note.description;
    Note.content = note.content;
    Note.publish = note.publish;
    Note.author = note.author;
    return Note;
}

function isValid (note, isUpdate = false) {
    if((!("title" in note) && !isUpdate) || 
        !note.title.trim()) return false;
    if(("publish" in note) && typeof note.publish != Boolean) return false;
    return true;
}

function filterNotesAsNotLoggedUser (filter) {
    const filterForUnpublished = ('publish' in filter) && !filter.publish;

    if(filterForUnpublished) return Promise.resolve([]);
    else filter.publish = true;

    return NoteModel.find(filter).populate('author')
    .catch((err) => Promise.reject(errors.basicError(err.message)));
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

    return NoteModel.find(filter).populate('author')
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.filterNotes = function (filter, user) {
    if(user) return filterNotesAsLoggedUser(filter, user);
    else return filterNotesAsNotLoggedUser(filter);
};

module.exports.findNoteById = function (id, user) {
    return NoteModel.findById(id).populate('author')
    .then(note => {
        if(note && ((user && note.author._id === user._id) || note.publish)) return Promise.resolve(note);
        else return Promise.reject(errors.notFoundOrUnavailable());
    });
}

module.exports.createNote = function (data, user) {
    data.author = user._id;
    var note = Note(data);

    if (!isValid(note)) return Promise.reject(errors.invalidData());
    
    return NoteModel.create(note)
    .catch((err) => Promise.reject(errors.basicError(err.message)));
};

module.exports.updateNote = function (noteId, updates, user) {
    if (!isValid(updates, true)) return Promise.reject(errors.invalidData());

    return NoteModel.findOne({ _id: noteId }, 'author')
    .then(note => {
        if(note && note.author === user._id) return NoteModel.updateOne({ _id: noteId }, updates);
        else if(note && note.author !== user._id) return Promise.reject(errors.unauthorizedOperation());
        else return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}

module.exports.deleteNote = function (noteId, user) {
    return NoteModel.findOne({ _id: noteId }, 'author')
    .then(note => {
        if(note && note.author === user._id) return NoteModel.deleteOne({ _id: noteId });
        else if(note && note.author !== user._id) return Promise.reject(errors.unauthorizedOperation());
        else return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}

module.exports.Note = Note;