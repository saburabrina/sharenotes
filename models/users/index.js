const persistence = require('./persistence');
const errors = require('../../lib/errors');

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
    return persistence.findById(id)
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

    return persistence.findById(userId)
    .then((usr) => {
        if(usr) {
            var favorite = usr.favorites.find((v,i,a) => (v._id == favoriteId));

            if(favorite) 
                return Promise.reject(errors.duplicatedResource());

            else {
                usr.favorites.push(favoriteId);

                var updates = { favorites: usr.favorites }
                return persistence.updateById(userId, updates);
            }
        }
        else
            return Promise.reject(errors.notFound("User not found."));
    });
}

module.exports.deleteFavorite = function (userId, favoriteId, user) {
    if(!(user._id.equals(userId))) 
        return Promise.reject(errors.unauthorizedOperation());

    return persistence.findById(userId)
    .then((usr) => {
        if(usr) {
            var favorite = usr.favorites.find((v,i,a) => (v._id == favoriteId));

            if(!favorite) 
                return Promise.reject(errors.notFound());

            else {
                usr.favorites.pull(favorite);

                var updates = { favorites: usr.favorites }
                return persistence.updateById(userId, updates);
            }
        }
        else
            return Promise.reject(errors.notFound("User not found."));
    });
}

module.exports.login = function (email, password) {
    return persistence.findByEmail(email)
    .then((user) => { 
        if (!user) 
        return Promise.reject(errors.dataDoesNotMatch("User does not exist. Given email not found."));
        
        if (!isCorrectPassword(password, user.hash, user.salt)) 
        return Promise.reject(errors.dataDoesNotMatch("Given password does not match given user's password."));
       
        const tokenObject = issueJWT(user);
        return Promise.resolve(tokenObject);  
    });
}
