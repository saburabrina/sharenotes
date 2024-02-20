function Author(author) {
    var Author = {}

    Author._id = author._id;
    Author.nickname = author.nickname;

    return Author;
}

module.exports.CreationCommentPattern = function (comment) {
    var AComment = {}

    AComment.comment = comment.comment;

    return AComment;
}

function AComment(comment) {
    var AComment = {}

    AComment._id = comment._id;
    AComment.comment = comment.comment;
    AComment.createdAt = comment.createdAt;
    AComment.author = Author(comment.author);

    return AComment;
}

function Comments(comments) {
    var Comments = [];

    for(var i = 0; i < comments.length; i++){
        var comment = AComment(comments[i]);
        Comments.push(comment);
    }

    return Comments;
}
module.exports.Comments = Comments;

module.exports.Filter = function (filter) {
    var Filter = {}

    Filter.text = filter.text;
    
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
    Note.comments = Comments(note.comments);

    return Note;
}

function SummarizedNote (note) {
    var Note = {}

    Note._id = note._id;
    Note.title = note.title;
    Note.author = Author(note.author);
    Note.description = note.description;
    Note.updatedAt = note.updatedAt;
    Note.publish = note.publish;
    
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