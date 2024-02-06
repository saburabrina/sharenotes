const { Notes } = require('../notes/objects');

module.exports.Filter = function (filter) {
    var Filter = {};

    if("nickname" in filter) Filter.nickname = filter.nickname;
    
    return Filter;
}

function User (user) {
    var User = {};

    User._id = user._id;
    User.nickname = user.nickname;
    User.createdAt = user.createdAt;
    if("notes" in user) User.notes = { notes : Notes(user.notes.notes), total : user.notes.total };
    
    return User;
};
module.exports.User = User;

module.exports.Users = function (users) {
    var Users = [];
    
    for(var i = 0; i < users.length; i++){
        var user = User(users[i]);
        Users.push(user);
    }

    return Users;
};

module.exports.CreationUserPattern = function (user) {
    var User = {};

    User.name = user.name;
    User.nickname = user.nickname;
    User.email = user.email;
    User.password = user.password;

    return User;
};

module.exports.UpdateUserPattern = function (updates) {
    var Updates = {};

    if("name" in updates) Updates.name = updates.name;
    if("nickname" in updates) Updates.nickname = updates.nickname;
    if("email" in updates) Updates.email = updates.email;
    
    return Updates;
};

module.exports.Profile = function (user) {
    var User = {};

    User._id = user._id;
    User.name = user.name;
    User.nickname = user.nickname;
    User.email = user.email;
    User.createdAt = user.createdAt;
    User.notes = ("notes" in user) ? { notes : Notes(user.notes.notes), total : user.notes.total } : [];
    
    return User;
};
