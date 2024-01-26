const model = require('./user');
const { emailREGEX, generatePassword, isCorrectPassword, issueJWT } = require('../lib/utils');

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
    if(!user.name || !user.nickname || !user.email) return false;
    if(!user.email.match(emailREGEX)) return false;
    if(!user.password) return false;
    else return isStrong(user.password)
}

function isStrong(password) {
    return true;
}

async function exists (user) {
    var userExists = false;

    await model.findOne({ $or: [
        { email: user.email, deleted: false }, 
        { nickname: user.nickname, deleted: false }
    ]})
    .then((user) => {
        if(user != null) userExists = true;
        return;
    })
    .catch((err) => console.log(err));

    return userExists;
}

module.exports.findUserById = function (id) {
    return model.findOne({ _id: id, deleted: false })
    .then(user => {
        if(user) return Promise.resolve(user);
        else return Promise.reject(new Error("User does not exist"));
    });
}

module.exports.findUsers = function (filter) {
    filter.deleted = false;

    return model.find(filter)
    .catch((err) => Promise.reject(new Error("Error on users search")));
}

module.exports.updateUserPassword = function (userId, password, user) {
    if(!(user._id.equals(userId))) return Promise.reject(new Error("Not allowed."));

    if (!isCorrectPassword(password.old, user.hash, user.salt)) 
        return Promise.reject(new Error("Password does not match."));
    
    if(!isStrong(password.new)) return Promise.reject(new Error("Password is too weak."));

    var [salt, hash] = generatePassword(password.new);

    return model.findOneAndUpdate({ _id: userId, deleted: false }, { salt, hash })
    .catch(() => Promise.reject(new Error("Error on password update.")));;
}

module.exports.updateUser = function (userId, updates, user) {
    if(!(user._id.equals(userId))) return Promise.reject(new Error("Not allowed."));

    return model.findOneAndUpdate({ _id: userId, deleted: false }, updates, { returnDocument: 'after'})
    .catch(() => Promise.reject(new Error("Error on user update.")));
}

module.exports.createUser = async function (data) {
    if(!isValid(data)) return Promise.reject(new Error("Invalid data for user creation."));
    if(await exists(data)) return Promise.reject(new Error("User with given email or nickname already exists."));
    
    [data.salt, data.hash] = generatePassword(data.password);
    var user = UserByObject(data);
    
    return model.create(user)
    .catch(() => Promise.reject(new Error("Error on user register.")));
}

module.exports.deleteUser = function (userId, user) {
    if(!(user._id.equals(userId))) return Promise.reject(new Error("Not allowed."));

    return model.findByIdAndUpdate(userId, { deleted: true })
    .catch(() => Promise.reject(new Error("Error on user deletion.")));
}

module.exports.login = function (email, password) {
    return model.findOne({ email: email, deleted: false })
    .then((user) => { 
        if (!user) 
        return Promise.reject(new Error("User does not exist. Given email not found."));
        
        if (!isCorrectPassword(password, user.hash, user.salt)) 
        return Promise.reject(new Error("Given password does not match given user's password."));
       
        const tokenObject = issueJWT(user);
        return Promise.resolve(tokenObject);  
    });
}

module.exports.User = User;