const NoteDocument = require('./note');
const notesPerPage = 2;

function notesToSkip(page){
    return (page * notesPerPage) - notesPerPage;
}

module.exports.create = function (note) {  
    return NoteDocument.create(note);
};

module.exports.find = function (data, page) {
    var skip = notesToSkip(page);

    return NoteDocument.find(data).populate('author').sort({ updatedAt : -1, _id : 1 }).skip(skip).limit(notesPerPage);
}

module.exports.findOne = function (data) {
    return NoteDocument.findOne(data).populate('author');
}

module.exports.findById = function (id) {
    return NoteDocument.findById(id).populate('author');
}

module.exports.updateById = function (id, updates) {
    return NoteDocument.findOneAndUpdate({ _id: id }, updates, { returnDocument: 'after'});
}

module.exports.deleteById = function (id) {
    return NoteDocument.deleteOne({ _id: id });
}