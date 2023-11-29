const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { filterNotes, createNote, findNoteById, updateNote, deleteNote } = require('../models/noteModel');
const errors = require('../lib/errors');
const notesRouter = express.Router();

function Author(author) {
    var Author = {}
    Author._id = author._id;
    Author.nickname = author.nickname;
    return Author;
}

function Note(note) {
    var Note = {}
    Note._id = note._id;
    Note.title = note.title;
    Note.author = Author(note.author);
    Note.description = note.description;
    Note.content = note.content;
    Note.publish = note.publish;
    Note.createdAt = note.createdAt;
    Note.updatedAt = note.updatedAt;
    return Note;
}

function SummarizedNote(note) {
    var Note = {}
    Note._id = note._id;
    Note.title = note.title;
    Note.author = Author(note.author);
    Note.description = note.description;
    Note.updatedAt = note.updatedAt;
    return Note;
}

function Notes(notes) {
    var Notes = [];
    
    for(var i = 0; i < notes.length; i++){
        var note = SummarizedNote(notes[i]);
        Notes.push(note);
    }

    return Notes;
}

function Filter(filter) {
    var Filter = {}
    if("title" in filter) Filter.title = filter.title;
    if("author" in filter) Filter.author = filter.author;
    if("description" in filter) Filter.description = filter.description;
    if("content" in filter) Filter.content = filter.content;
    if("publish" in filter) Filter.publish = filter.publish;
    if("createdAt" in filter) Filter.createdAt = filter.createdAt;
    if("updatedAt" in filter) Filter.updatedAt = filter.updatedAt;
    return Filter;
}

function Updates(update) {
    var Updates = {}
    if("title" in update) Updates.title = update.title;
    if("description" in update) Updates.description = update.description;
    if("content" in update) Updates.content = update.content;
    if("publish" in update) Updates.publish = update.publish;
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

notesRouter.route('/')

.get(passport.authenticate(['jwt', 'anonymous'], { session: false }),
(req, res, next) => {
    if (!req.body.filter) req.body.filter = {};
    next();

}, (req, res, next) => {
    var filter = Filter(req.body.filter);
    
    filterNotes(filter, req.user)
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
    createNote(req.body.note, req.user)
    .then((note) => {
        res.json(Note(note));
    })
    .catch((err) => 
        next(errors.basicNoteError(err.message, "Error on note creation. Try again.")));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});


notesRouter.route("/:noteId")

.get(
(req, res, next) => {
    findNoteById(req.params.noteId)
    .then((note) => res.json(Note(note)))
    .catch((err) => next(errors.basicNoteError(err.message)));
})

.put(passport.authenticate('jwt', { session: false }),
(req, res, next) => {
    if(!req.body.note) res.json({});
    else next();

}, (req, res, next) => {
    var updates = Updates(req.body.note);

    updateNote(req.params.noteId, updates, req.user)
    .then((note) => res.json(Note(note)))
    .catch((err) => 
        next(errors.basicNoteError(err.message, "Error on note update. Try again.")));
})

.delete(passport.authenticate('jwt', { session: false }),
(req, res, next) => { 
    deleteNote(req.params.noteId, req.user)
    .then(() => res.end())
    .catch((err) => 
        next(errors.basicNoteError(err.message, "Error on note deletion. Try again.")));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

module.exports = notesRouter;
