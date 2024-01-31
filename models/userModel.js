const model = require('./user');
const { emailREGEX, generatePassword, isCorrectPassword, issueJWT } = require('../lib/utils');

const errors = require('../lib/errors');

function User (name, nickname, email, hash, salt) {
    var User = {};
    User.name = name;
    User.nickname = nickname;
    User.email = email;
    User.hash = hash;
    User.salt = salt;
    return User;
};

function UserByObject ({ name, nickname, email, hash, salt }) {
    return User (name, nickname, email, hash, salt);
}

function isValid (user) {
    if(!("name" in user) || !("nickname" in user) || !("email" in user)) return false;
    if(!user.email.match(emailREGEX)) return false;
    if(!user.password) return false;
    else return isStrong(user.password)
}

function isStrong(password) {
    return true;
}

async function exists (user) {
    var userExists = true;

    await model.findOne({ $or: [
        { email: user.email, deleted: false }, 
        { nickname: user.nickname, deleted: false }
    ]})
    .then((user) => {
        if(user == null) userExists = false;
        return;
    })
    .catch((err) => console.error(err));

    return userExists;
}

module.exports.findUserById = function (id) {
    return model.findOne({ _id: id, deleted: false })
    .then(user => {
        if(user) return Promise.resolve(user);
        else return Promise.reject(errors.notFound("User does not exist"));
    });
}

module.exports.findUsers = function (filter) {
    filter.deleted = false;

    return model.find(filter)
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.updateUserPassword = function (userId, password, user) {
    if(!(user._id.equals(userId))) return Promise.reject(errors.unauthorizedOperation());

    if (!isCorrectPassword(password.old, user.hash, user.salt)) 
        return Promise.reject(errors.dataDoesNotMatch("Password does not match."));
    
    if(!isStrong(password.new)) return Promise.reject(errors.weakPassword());

    var [salt, hash] = generatePassword(password.new);

    return model.findOneAndUpdate({ _id: userId, deleted: false }, { salt, hash })
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.updateUser = function (userId, updates, user) {
    if(!(user._id.equals(userId))) return Promise.reject(errors.unauthorizedOperation());

    return model.findOneAndUpdate({ _id: userId, deleted: false }, updates, { returnDocument: 'after'})
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.createUser = async function (data) {
    if(!isValid(data)) return Promise.reject(errors.invalidData());
    if(await exists(data)) return Promise.reject(errors.userAlreadyRegistered());
    
    [data.salt, data.hash] = generatePassword(data.password);
    var user = UserByObject(data);
    
    return model.create(user)
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.deleteUser = function (userId, user) {
    if(!(user._id.equals(userId))) return Promise.reject(errors.unauthorizedOperation());

    return model.findByIdAndUpdate(userId, { deleted: true })
    .catch((err) => Promise.reject(errors.basicError(err.message)));
}

module.exports.login = function (email, password) {
    return model.findOne({ email: email, deleted: false })
    .then((user) => { 
        if (!user) 
        return Promise.reject(errors.dataDoesNotMatch("User does not exist. Given email not found."));
        
        if (!isCorrectPassword(password, user.hash, user.salt)) 
        return Promise.reject(errors.dataDoesNotMatch("Given password does not match given user's password."));
       
        const tokenObject = issueJWT(user);
        return Promise.resolve(tokenObject);  
    });
}

module.exports.User = User;