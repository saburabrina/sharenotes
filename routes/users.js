var express = require('express');
const mongoose = require('mongoose');
const usersRouter = express.Router();

const { findUserById, findUsers, createUser, updateUser, updateUserPassword, deleteUser }  = require('../models/userModel');
const { filterNotes }  = require('../models/noteModel');

const { authenticatedRoute } = require('../passport/passport');
const errors = require('../lib/errors');

function User (user) {
    var User = {};
    User._id = user._id;
    User.nickname = user.nickname;
    User.createdAt = user.createdAt;
    if("notes" in user) User.notes = Notes(user.notes);
    return User;
};

function Users (users) {
    var Users = [];
    
    for(var i = 0; i < users.length; i++){
        var user = User(users[i]);
        Users.push(user);
    }

    return Users;
};

function Profile (user) {
    var User = {};
    User._id = user._id;
    User.name = user.name;
    User.nickname = user.nickname;
    User.email = user.email;
    User.createdAt = user.createdAt;
    User.notes = ("notes" in user) ? Notes(user.notes) : [];
    return User;
};

function Note(note) {
    var Note = {}
    Note._id = note._id;
    Note.title = note.title;
    Note.description = note.description;
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

function Updates (updates) {
    var Updates = {};
    if("name" in updates) Updates.name = updates.name;
    if("nickname" in updates) Updates.nickname = updates.nickname;
    if("email" in updates) Updates.email = updates.email;
    return Updates;
};

function Filter (filter) {
    var Filter = {};
    if("nickname" in filter) Filter.nickname = filter.nickname;
    return Filter;
}

usersRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

usersRouter.use('/:userId', (req, res, next) => {
    if(mongoose.isValidObjectId(req.params.userId)) next();
    else next(errors.notFound());
});

usersRouter.route('/')

.get((req, res, next) => {
    var filter = Filter(req.query);
    findUsers(filter)
    .then((users) => res.json(Users(users)))
    .catch((err) => next(err));
})

.post((req, res, next) => {
    if(!req.body.user || !req.body.user.password || 
        !req.body.user.name || !req.body.user.nickname || !req.body.user.email) 
    next(errors.missingRequiredData());
    else next();

}, (req, res, next) => {
    createUser(req.body.user)
    .then(() => res.end())
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

usersRouter.route('/:userId')

.get(authenticatedRoute(),
(req, res, next) => {
    findUserById(req.params.userId)
    .then((user) => {
        return filterNotes({ author: user._id }, req.user)
        .then((notes) => {
            user.notes = notes;
            if(req.user && user._id.equals(req.user._id)) res.json(Profile(user));
            else res.json(User(user));
        });
    })
    .catch((err) => next(err));
})

.put(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.user) next(errors.missingRequiredData());
    else next();
},
(req, res, next) => {
    var updates = Updates(req.body.user);
    
    updateUser(req.params.userId, updates, req.user)
    .then((mUser) => {
        return filterNotes({ author: mUser._id }, req.user)
        .then((notes) => {
            mUser.notes = notes;
            res.json(Profile(mUser));
        });
    })
    .catch((err) => next(err));
})

.delete(authenticatedRoute(true),
(req, res, next) => {
    deleteUser(req.params.userId, req.user)
    .then(() => {
        res.clearCookie("jwt", { httpOnly: true });
        res.end();
    })
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

usersRouter.route('/:userId/password')

.put(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.password || !req.body.password.old || !req.body.password.new) 
    next(errors.missingRequiredData());
    else next();
},
(req, res, next) => {
    updateUserPassword(req.params.userId, req.body.password, req.user)
    .then(() => res.end())
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

module.exports = usersRouter;
