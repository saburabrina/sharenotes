const mongoose = require('mongoose');
const fs = require('fs');
const Note = require('./models/note');
const utils = require('./lib/utils');

function initializeDatabase () {
    return populateDatabase();
}

function populateDatabase () {
    const file = fs.readFileSync('./populate.json', 'utf-8');
    const data = JSON.parse(file);

    return Note.insertMany(data.note)
    .then((notes) => {
        console.log("Notes insertion worked correctly")
        return notes;
    })
    .catch((err) => {return console.log(err)});
}

function clearDatabase () {
    return Note.deleteMany({})
    .then((notes) => {
        console.log("Database Cleaning Worked Correctly");
        closeDatabase();
    })
    .catch((err) => {return console.log(err)});
}

function closeDatabase () {
    return mongoose.connection.close();
}

module.exports.initializeDatabase = initializeDatabase;
module.exports.clearDatabase = clearDatabase;

