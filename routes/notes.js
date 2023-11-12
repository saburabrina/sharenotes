const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const errors = require('../lib/errors');
const Notes = require('../models/note');
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
    else next(errors.inexistentNoteId(req.params.noteId));
});

notesRouter.route('/')
// find public notes
// must return unpublished notes from user or published notes
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
.post(passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    if(!req.body.note) res.json({});
    else next();

}, (req, res, next) => {
    var note = Note(req.body.note);
    var [isvalid, err] = Notes.isValid(note);
    if (!isvalid) next(err);
    else next();

}, (req, res, next) => {
    var note = Note(req.body.note);
    Notes.create(note)
    .then((note) => {
        res.json(note);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// must find only from unpublished notes from user or published notes
notesRouter.route("/:noteId")
.get((req, res, next) => {
    Notes.findById(req.params.noteId)
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
})
// update note
.post(passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    if(!req.body.note) res.json({});
    else next();

}, (req, res, next) => { 
    var updates = Note(req.body.note);
    var [isvalid, err] = Notes.isValid(updates, false);
    if (!isvalid) next(err);
    else next();
    
}, (req, res, next) => {
    var updates = Note(req.body.note);
    Notes.findByIdAndUpdate(req.params.noteId, updates, { new: true })
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
})
.delete(passport.authenticate('jwt', { session: false }),
(req, res, next) => { 
    Notes.findByIdAndDelete(req.params.noteId)
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
});

module.exports = notesRouter;
