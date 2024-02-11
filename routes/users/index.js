const mongoose = require('mongoose');
const express = require('express');
const usersRouter = express.Router();

const { findUserById, findUsers, createUser, updateUser, updateUserPassword, deleteUser, createFavorite, deleteFavorite }  = require('../../models/users/');
const { findNotes }  = require('../../models/notes/');
const { Filter, Profile, User, Users, CreationUserPattern, UpdateUserPattern } = require('./objects');

const { authenticatedRoute } = require('../../passport/');
const errors = require('../../lib/errors');

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
    if(!req.body.filter) req.body.filter = {};
    if(!req.body.page) req.body.page = 1;
    next();
},
(req, res, next) => {
    var filter = Filter(req.body.filter);

    findUsers(filter, req.body.page)
    .then((result) => {
        result.users = Users(result.users);
        res.json(result)
    })
    .catch((err) => next(err));
})

.post((req, res, next) => {
    if(!req.body.user || !req.body.user.password || 
        !req.body.user.name || !req.body.user.nickname || !req.body.user.email) 
    next(errors.missingRequiredData());
    else next();

}, (req, res, next) => {
    var data = CreationUserPattern(req.body.user);

    createUser(data)
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
        return findNotes({ author: user._id }, 1, req.user)
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
    next();
},
(req, res, next) => {
    var updates = UpdateUserPattern(req.body.user);
    
    updateUser(req.params.userId, updates, req.user)
    .then((updatedUser) => {
        return findNotes({ author: updatedUser._id }, 1, req.user)
        .then((notes) => {
            updatedUser.notes = notes;
            res.json(Profile(updatedUser));
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

usersRouter.route('/:userId/favorites')

.post(authenticatedRoute(true),
(req, res, next) => { 
    if(!req.body.favorite) next(errors.missingRequiredData());
    else next();
}, (req, res, next) => {
    createFavorite(req.params.userId, req.body.favorite, req.user)
    .then(() => res.end())
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

usersRouter.route('/:userId/favorites/:favoriteId')

.get((req, res, next) => {
    res.redirect('/notes/' + req.params.favoriteId);
})

.delete(authenticatedRoute(true),
(req, res, next) => {
    deleteFavorite(req.params.userId, req.params.favoriteId, req.user)
    .then(() => res.end())
    .catch((err) => next(err));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

module.exports = usersRouter;