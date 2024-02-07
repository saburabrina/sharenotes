const ObjectId = require('mongoose').Types.ObjectId;

const persistence = require('./persistence');
const errors = require('../../lib/errors');

function isValid (note, forUpdate = false) {
    if(!("title" in note) && !forUpdate) return false;
    if(("title" in note) && !(note.title.trim())) return false;
    if(("publish" in note) && typeof note.publish !== "boolean") return false;
    return true;
}

function IsUserTheAuthor(authorId, userId) {
    return authorId.equals(userId);
}

function makeFilter (filter, user) {
    if(user) { 
        var filterForPrivateFromUser = { ...filter };
        filterForPrivateFromUser.author = new ObjectId(user._id);
        filterForPrivateFromUser.publish = false;

        var filterForPrivateFromOtherAuthor = null;

        var filterForPublished = { ...filter };
        filterForPublished.publish = true;

        var filterByOtherAttributes = { $or: [ filterForPublished, filterForPrivateFromUser ]};

        if("publish" in filter) {
            if(filter.publish === false) {
                if(("author" in filter) && !IsUserTheAuthor(filter.author, user._id)) 
                    return filterForPrivateFromOtherAuthor;

                else return filterForPrivateFromUser;
            }

            else return filter;
        }
        else if("author" in filter) {
            if(!IsUserTheAuthor(filter.author, user._id)) 
                return filterForPublished;
            else return filter
        }
        else return filterByOtherAttributes;

    } else {
        var filterForPublished = { ...filter };
        filterForPublished.publish = true;

        var filterForPrivate = null;

        if(("publish" in filter) && filter.publish === false) return filterForPrivate;
        else return filterForPublished;
    }
}

module.exports.createNote = function (note, user) {
    note.author = user._id;

    if (!isValid(note)) 
        return Promise.reject(
        errors.invalidData());
    
    return persistence.create(note)
    .catch((err) => Promise.reject(
        errors.basicError(err.message)));
};

module.exports.findNote = function (filter, user) {
    return persistence.findOne(filter)
    .then(note => {
        
        if(note && (note.publish || (user && IsUserTheAuthor(note.author._id, user._id)))) 
            return Promise.resolve(note);
        
        else 
            return Promise.reject(errors.notFoundOrUnavailable());
    });
}

module.exports.findNotes = function (filter, page, user) {
    filter = makeFilter(filter, user);
    
    if(filter == null) return Promise.resolve([]);

    return persistence.find(filter, page)
    .catch((err) => Promise.reject(errors.basicError(err.message)));
};

module.exports.updateNote = function (noteId, updates, user) {
    if (!isValid(updates, true)) 
        return Promise.reject(errors.invalidData());

    return persistence.findById(noteId)
    .then(note => {
        if(note && IsUserTheAuthor(note.author._id, user._id)) 
            return persistence.updateById(noteId, updates);
        
        else if(note && !IsUserTheAuthor(note.author._id, user._id)) 
            return Promise.reject(errors.unauthorizedOperation());
        
        else 
            return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}

module.exports.deleteNote = function (noteId, user) {
    return persistence.findById(noteId)
    .then(note => {

        if(note && IsUserTheAuthor(note.author._id, user._id)) 
            return persistence.deleteById(noteId);

        else if(note && !IsUserTheAuthor(note.author._id, user._id)) 
            return Promise.reject(errors.unauthorizedOperation());

        else 
            return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}

module.exports.commentNote = function (noteId, comment, user) {
    return persistence.findById(noteId)
    .then(note => {
        if(note) {
            if(!note.publish) 
                return Promise.reject(errors.notFound("Note is private."));
            
            else if (!(comment.comment.trim())) 
                return Promise.reject(errors.invalidData("Empty Comment"));

            else {
                comment.author = user._id;
                note.comments.push(comment);
                var updates = { comments: note.comments }

                return persistence.updateById(noteId, updates);
            }
        }       
        else 
            return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}

module.exports.deleteComment = function (noteId, commentId, user) {
    return persistence.findById(noteId)
    .then(note => {
        if(note) {
            var comment = note.comments.id(commentId);

            if(comment == null || !note.publish)
                return Promise.reject(errors.notFound("Comment not found or note is private."));

            else if(!IsUserTheAuthor(comment.author._id, user._id))
                return Promise.reject(errors.unauthorizedOperation());

            else {
                note.comments.pull(comment);

                var updates = { comments: note.comments }
                return persistence.updateById(noteId, updates);
            }
        }       
        else 
            return Promise.reject(errors.notFound("Note with given id not found ond Database."));
    });
}