const persistence = require('./persistence');
const errors = require('../../lib/errors');

const noteModel = require('../notes/');

const { emailREGEX, generatePassword, isCorrectPassword, issueJWT } = require('../../lib/utils');

function User (user) {
    var User = {};

    User.name = user.name;
    User.nickname = user.nickname;
    if("bio" in user) User.bio = user.bio;
    User.email = user.email;
    User.hash = user.hash;
    User.salt = user.salt;

    return User;
};

function isValid (user) {
    if(!("name" in user) || !("nickname" in user) || !("email" in user)) return false;
    if(!user.email.match(emailREGEX)) return false;
    if(!user.password) return false;
    else return isStrong(user.password);
}

function isStrong(password) {
    return true;
}

async function exists (user) {
    var userExists = true;

    await persistence.findByEmailOrNickname(user.email, user.nickname)
    .then((user) => {
        if(user == null) userExists = false;
        return;
    })
    .catch((err) => console.error(err));

    return userExists;
}

module.exports.createUser = async function (data) {
    if(!isValid(data)) 
        return Promise.reject(errors.invalidData());
    
    if(await exists(data)) 
        return Promise.reject(errors.userAlreadyRegistered());
    
    [data.salt, data.hash] = generatePassword(data.password);
    var user = User(data);
    
    return persistence.create(user)
    .catch((err) => Promise.reject(
        errors.basicError(err.message)));
}

module.exports.findUserById = function (id) {
    return persistence.findByIdAndPopulate(id)
    .then(user => {
        if(user) return Promise.resolve(user);
        else return Promise.reject(errors.notFound("User does not exist"));
    });
}

module.exports.findUsers = function (filter, page) {
    return persistence.find(filter, page)
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.updateUser = function (userId, updates, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    return persistence.updateById(userId, updates)
    .catch((err) => Promise.reject(
        errors.basicError(err.message)));
}

module.exports.updateUserPassword = function (userId, password, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    if (!isCorrectPassword(password.old, user.hash, user.salt)) 
        return Promise.reject(errors.dataDoesNotMatch("Password does not match."));
    
    if(!isStrong(password.new)) 
        return Promise.reject(errors.weakPassword());

    var [salt, hash] = generatePassword(password.new);

    return persistence.updateById(userId, { salt, hash })
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.deleteUser = function (userId, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    return persistence.deleteById(userId)
    .catch((err) => Promise.reject(
        errors.basicError(err.message)));
}

module.exports.createFavorite = function (userId, favoriteId, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    return noteModel.findNote({ _id : favoriteId }, user)
    .then((favNote) => {
        if(favNote) {
            return persistence.findById(userId)
            .then((usr) => {
                if(usr) {
                    var favorite = usr.favorites.includes(favNote);

                    if(favorite) 
                        return Promise.reject(errors.duplicatedResource());

                    else {
                        usr.favorites.push(favNote);

                        var updates = { favorites: usr.favorites }
                        return persistence.updateById(userId, updates);
                    }
                }
                else
                    return Promise.reject(errors.notFound("User not found."));
            });
        } else 
            return Promise.reject(errors.notFoundOrUnavailable("Note is private or does not exist."));
    });
}

module.exports.deleteFavorite = function (userId, favoriteId, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    return persistence.findById(userId)
    .then((usr) => {
        if(usr) {
            var favorite = usr.favorites.includes(favoriteId);

            if(!favorite) 
                return Promise.reject(errors.notFound());

            else {
                usr.favorites.pull(favoriteId);

                var updates = { favorites: usr.favorites }
                return persistence.updateById(userId, updates);
            }
        }
        else
            return Promise.reject(errors.notFound("User not found."));
    });
}

module.exports.login = function (identifier, password) {
    return persistence.findByEmailOrNickname(identifier, identifier)
    .then((user) => { 
        if (!user) 
        return Promise.reject(errors.dataDoesNotMatch("User does not exist. Given email or nickname not found."));
        
        if (!isCorrectPassword(password, user.hash, user.salt)) 
        return Promise.reject(errors.dataDoesNotMatch("Given password does not match given user's password."));
       
        const tokenObject = issueJWT(user);
        return Promise.resolve(tokenObject);  
    });
}
