const express = require('express');
const mongoose = require('mongoose');

const Notes = require('../models/notes');
const notesRouter = express.Router();

function Note(note) {
    var Note = {}
    if(note.title) Note.title = note.title;
    if(note.description) Note.description = note.description;
    if(note.content) Note.content = note.content;
    if(note.publish) Note.publish = note.publish;
    return Note;
}

notesRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

notesRouter.use('/:noteId', (req, res, next) => {
    if(mongoose.isValidObjectId(req.params.noteId)) next();
    else next({ 
        status: 404,
        clientMsg: "Inexistent note", 
        message: "User tried to retrive note by an invalid note id",
        value: req.params.noteId
    });
});

notesRouter.route('/')
// find public notes
.get((req, res, next) => {
    if (!req.body.filter) res.json({});
    else next();
}, (req, res, next) => {
    var filter = Note(req.body.filter);
    filter.publish = true;

    Notes.find(filter)
    .then((notes) => {
        res.json(notes);
    }, (err) => {
        next(err);
    })
    .catch((err) => {
        next(err);
    });
})
.post((req, res, next) => {
    if(!req.body.note) res.json({});
    else next();
}, (req, res, next) => {
    var note = Note(req.body.note);
    var [isvalid, err] = Notes.isValid(note);
    if (!isvalid) next(err);
    else next();
}, (req, res, next) => {
    Notes.create(note)
    .then((note) => {
        res.json(note);
    }, (err) => next(err))
    .catch((err) => next(err));
});

notesRouter.route("/:noteId")
.get((req, res, next) => {
    Notes.findById(req.params.noteId)
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
})
// update note
// only to authors
.post((req, res, next) => {
    if(!req.body.note) res.json({});
    else next();
}, (req, res, next) => { 
    var updates = Note(req.body.note);
    var [isvalid, err] = Notes.isValid(updates, false);
    if (!isvalid) next(err);
    else next();
}, (req, res, next) => {
    Notes.findByIdAndUpdate(req.params.noteId, updates, { new: true })
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
})
// only to authors
.delete((req, res, next) => { 
    Notes.findByIdAndDelete(req.params.noteId)
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
});

module.exports = notesRouter;
