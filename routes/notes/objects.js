function Author(author) {
    var Author = {}

    Author._id = author._id;
    Author.nickname = author.nickname;

    return Author;
}

module.exports.Filter = function (filter) {
    var Filter = {}

    if("title" in filter) Filter.title = filter.title;
    if("author" in filter) Filter.author = filter.author;
    if("description" in filter) Filter.description = filter.description;
    if("content" in filter) Filter.content = filter.content;
    if("publish" in filter) Filter.publish = filter.publish;
    if("createdAt" in filter) Filter.createdAt = filter.createdAt;
    if("updatedAt" in filter) Filter.updatedAt = filter.updatedAt;
    
    return Filter;
}

module.exports.UpdateNotePattern = function (update) {
    var Updates = {}

    if("title" in update) Updates.title = update.title;
    if("description" in update) Updates.description = update.description;
    if("content" in update) Updates.content = update.content;
    if("publish" in update) Updates.publish = update.publish;
    
    return Updates;
}

module.exports.CreationNotePattern = function (note) {
    var Note = {}

    Note.title = note.title;
    if("description" in note) Note.description = note.description;
    if("content" in note) Note.content = note.content;
    if("publish" in note) Note.publish = note.publish;

    return Note;
}

module.exports.DetailedNote = function (note) { 
    var Note = {}

    Note._id = note._id;
    Note.title = note.title;
    Note.author = Author(note.author);
    Note.description = note.description;
    Note.content = note.content;
    Note.publish = note.publish;
    Note.createdAt = note.createdAt;
    Note.updatedAt = note.updatedAt;

    return Note;
}

function SummarizedNote (note) {
    var Note = {}

    Note._id = note._id;
    Note.title = note.title;
    Note.author = Author(note.author);
    Note.description = note.description;
    Note.updatedAt = note.updatedAt;
    
    return Note;
}
module.exports.SummarizedNote = SummarizedNote;

module.exports.Notes = function (notes) {
    var Notes = [];
    
    for(var i = 0; i < notes.length; i++){
        var note = SummarizedNote(notes[i]);
        Notes.push(note);
    }

    return Notes;
}