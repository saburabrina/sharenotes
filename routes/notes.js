const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { filterNotes, createNote, findNoteById, updateNote, deleteNote } = require('../models/noteModel');
const errors = require('../lib/errors');
const notesRouter = express.Router();

function Note(note) {
    var Note = {}
    Note._id = note._id;
    Note.title = note.title;
    Note.description = note.description;
    Note.content = note.content;
    Note.publish = note.publish;
    Note.createdAt = note.createdAt;
    Note.updatedAt = note.updatedAt;
    return Note;
}

function Notes(notes) {
    var Notes = [];
    
    for(var i = 0; i < notes.length; i++){
        var note = Note(notes[i]);
        Notes.push(note);
    }

    return Notes;
}

function Filter(filter) {
    var Filter = {}
    if(filter.title) Filter.title = filter.title;
    if(filter.description) Filter.description = filter.description;
    if(filter.content) Filter.content = filter.content;
    if(filter.publish) Filter.publish = filter.publish;
    if(filter.createdAt) Filter.createdAt = filter.createdAt;
    if(filter.updatedAt) Filter.updatedAt = filter.updatedAt;
    return Filter;
}

function Updates(update) {
    var Updates = {}
    if(update.title) Updates.title = update.title;
    if(update.description) Updates.description = update.description;
    if(update.content) Updates.content = update.content;
    if(update.publish) Updates.publish = update.publish;
    return Updates;
}

notesRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

notesRouter.use('/:noteId', (req, res, next) => {
    if(mongoose.isValidObjectId(req.params.noteId)) next();
    else next(errors.inexistentNoteId(req.params.noteId));
});

notesRouter.route('/').get(
(req, res, next) => {
    if (!req.body.filter) res.json({});
    else next();

}, (req, res, next) => {
    var filter = Filter(req.body.filter);

    filterNotes(filter)
    .then((notes) => {
        res.json(Notes(notes));
    })
    .catch((err) => next(errors.basicNoteError(err.message)));
})
.post(passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    if(!req.body.note) res.json({});
    else next();

}, (req, res, next) => {
    createNote(req.body.note)
    .then((note) => {
        res.json(Note(note));
    })
    .catch((err) => next(err));
});


notesRouter.route("/:noteId")
.get((req, res, next) => {
    findNoteById(req.params.noteId)
    .then((note) => res.json(Note(note)))
    .catch((err) => next(err));
})
.post(passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    if(!req.body.note) res.json({});
    else next();

}, (req, res, next) => {
    var updates = Updates(req.body.note);

    updateNote(req.params.noteId, updates)
    .then((note) => res.json(Note(note)))
    .catch((err) => next(err));
})
.delete(passport.authenticate('jwt', { session: false }),
(req, res, next) => { 
    deleteNote(req.params.noteId)
    .then(() => res.end())
    .catch((err) => next(err));
});

module.exports = notesRouter;
