const mongoose = require('mongoose');
const express = require('express');
const notesRouter = express.Router();

const { createNote, findNote, findNotes, updateNote, deleteNote } = require('../../models/notes/');
const { Filter, CreationNotePattern, UpdateNotePattern, DetailedNote, Notes } = require('./objects');

const { authenticatedRoute } = require('../../passport/passport');
const errors = require('../../lib/errors');

notesRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

notesRouter.use('/:noteId', (req, res, next) => {
    if(mongoose.isValidObjectId(req.params.noteId)) next();
    else next(errors.notFound());
});

notesRouter.route('/')

.get(authenticatedRoute(),
(req, res, next) => {
    if (!req.body.filter) req.body.filter = {};
    if (!req.body.page) req.body.page = 1;
    next();

}, (req, res, next) => {
    var filter = Filter(req.body.filter);
    
    findNotes(filter, req.body.page, req.user)
    .then((notes) => {
        res.json(Notes(notes));
    })
    .catch((err) => next(err));
})

.post(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.note || !req.body.note.title) 
    next(errors.missingRequiredData())
    else next();

}, (req, res, next) => {
    var data = CreationNotePattern(req.body.note);

    createNote(data, req.user)
    .then((note) => {
        res.json(DetailedNote(note));
    })
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

notesRouter.route("/:noteId")

.get(authenticatedRoute(),
(req, res, next) => {
    findNote({ _id: req.params.noteId }, req.user)
    .then((note) => res.json(DetailedNote(note)))
    .catch((err) => next(err));
})

.put(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.note) next(errors.missingRequiredData());
    else next();

}, (req, res, next) => {
    var updates = UpdateNotePattern(req.body.note);

    updateNote(req.params.noteId, updates, req.user)
    .then((note) => {
        res.json(DetailedNote(note));
    })
    .catch((err) => next(err));
})

.delete(authenticatedRoute(true),
(req, res, next) => { 
    deleteNote(req.params.noteId, req.user)
    .then(() => res.end())
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

module.exports = notesRouter;