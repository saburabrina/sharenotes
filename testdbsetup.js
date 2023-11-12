const mongoose = require('mongoose');
const Note = require('./models/note');
const User = require('./models/user');
const utils = require('./lib/utils');

const JSONdata = require('./populate.json');

function initializeDatabase () {
    return new Promise();
}

function insertUsers () {
    let users = JSONdata.user.map(({name, nickname, email, password}) => {
        let [ salt, hash ] = utils.generatePassword(password);
        return { name, nickname, email, hash, salt};
    });

    return User.insertMany(users).then((us) => {
        console.log("Users insertion worked correctly");
        return us;
    })
    .catch((err) => console.log(err));
}

function insertNotes () {
    return Note.insertMany(JSONdata.note).then((ns) => {
        console.log("Notes insertion worked correctly");
        return ns;
    })
    .catch((err) => console.log(err));
}

function clearDatabase () {
    return Promise.all([
        Note.deleteMany({}),
        User.deleteMany({})
    ]).then(([notes, users]) => {
        console.log("Notes Cleaning Worked Correctly");
        console.log("Users Cleaning Worked Correctly");
        return closeDatabase();
    })
    .catch((err) => {return console.log(err)});
}

function closeDatabase () {
    return mongoose.connection.close();
}

module.exports.initializeDatabase = initializeDatabase;
module.exports.insertUsers = insertUsers;
module.exports.insertNotes = insertNotes;
module.exports.clearDatabase = clearDatabase;

