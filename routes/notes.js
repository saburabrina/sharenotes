const express = require('express');

const Notes = require('../models/notes');
const notesRouter = express.Router();

notesRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

notesRouter.route('/')
.get((req, res, next) => {
    var filter = {};
    if(req.body.title) filter = { title: req.body.title };
    
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
    var newNote = {}
    if(!req.body.title || !req.body.description) return res.json({});
    
    newNote.title = req.body.title;
    newNote.description = req.body.description;
    newNote.content = req.body.content;

    Notes.create(newNote)
    .then((note) => {
        console.log('Note Created ', note);
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
.post((req, res, next) => { 
    var newNote = {}
    
    if(req.body.title) newNote.title = req.body.title;
    if(req.body.description) newNote.description = req.body.description;
    if(req.body.content) newNote.content = req.body.content;
    if(req.body.publish) newNote.publish = req.body.publish;

    Notes.findByIdAndUpdate(
        req.params.noteId,
        newNote,
        { new: true })
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => { 
    Notes.findByIdAndDelete(req.params.noteId)
    .then((note) => res.json(note) , (err) => next(err))
    .catch((err) => next(err));
});

module.exports = notesRouter;
