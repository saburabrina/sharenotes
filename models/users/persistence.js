const UserDocument = require('./user');
const notesPerPage = 2;

function notesToSkip(page){
    return (page * notesPerPage) - notesPerPage;
}

module.exports.create = function (user) {  
    return UserDocument.create(user);
};

module.exports.find = function (data, page) {
    var skip = notesToSkip(page);
    data.deleted = false;

    return UserDocument.find(data).sort({ nickname : 1, _id : 1 })
    .skip(skip).limit(notesPerPage)
    .then((users) => {
        return UserDocument.countDocuments(data)
        .then((total) => {
            return { total: total, users: users }});
    });
}

module.exports.findById = function (id) {
    return UserDocument.findOne({ _id: id, deleted: false });
}

module.exports.findByIdAndPopulate = function (id) {
    return UserDocument.findOne({ _id: id, deleted: false }).populate('favorites');
}

module.exports.findByEmail = function (email) {
    return UserDocument.findOne({ email: email, deleted: false });
}

module.exports.findByEmailOrNickname = function (email, nickname) {
    return UserDocument.findOne({ $or: [
        { email: email, deleted: false }, 
        { nickname: nickname, deleted: false }
    ]});
}

module.exports.updateById = function (id, updates) {
    return UserDocument.findOneAndUpdate({ _id: id, deleted: false }, updates, { returnDocument: 'after'});
}

module.exports.deleteById = function (id) {
    return UserDocument.findByIdAndUpdate(id, { deleted: true });
}