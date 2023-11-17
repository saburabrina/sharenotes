const UserModel = require('./user');
const { emailREGEX, generatePassword } = require('../lib/utils');

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
    return true;
}

async function exists (user) {
    var userExists = false;

    await UserModel.findOne({ $or: [
        { email: user.email }, 
        { nickname: user.nickname }
    ]})
    .then((user) => {
        if(user != null) userExists = true;
        return;
    })
    .catch((err) => console.log(err));

    return userExists;
}

module.exports.Signup = async function (data) {
    if(!isValid(data)) return Promise.reject(new Error("Invalid data for user creation."));
    if(await exists(data)) return Promise.reject(new Error("User already exists."));
    
    [data.salt, data.hash] = generatePassword(data.password);
    var user = UserByObject(data);
    
    return UserModel.create(user)
    .then((user) => user)
    .catch((err) => err);
    
    /*
    return isValid(data)
    .then(() => doNotExists(data.email))
    .then(() => {
        [data.salt, data.hash] = generatePassword(data.password);
        var user = UserByObject(data);
    
        return UserModel.create(user)
    })
    .then((user) => user)
    .catch((err) => err);
    */
}