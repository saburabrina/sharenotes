var express = require('express');
var usersRouter = express.Router();

const { findUserById, findUsers, createUser, updateUser, updateUserPassword, deleteUser }  = require('../models/userModel');
const { filterNotes }  = require('../models/noteModel');

const errors = require('../lib/errors');
const { authenticatedRoute } = require('../passport/passport');

function User (user) {
    var User = {};
    User._id = user._id;
    User.nickname = user.nickname;
    User.createdAt = user.createdAt;
    if("notes" in user) User.notes = user.notes;
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
    User.updatedAt = user.updatedAt;
    User.notes = ("notes" in user) ? user.notes : [];
    return User;
};

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

usersRouter.route('/')

.get((req, res, next) => {
    var filter = Filter(req.query);
    findUsers(filter)
    .then((users) => res.json(Users(users)))
    .catch((err) => next(errors.basicUserError(err.message, err.message)));
})

.post((req, res, next) => {
    if(!req.body.user || !req.body.user.password || 
        !req.body.user.name || !req.body.user.nickname || !req.body.user.email) 
    next(errors.missingRequiredDataToSignup());
    next();

}, (req, res, next) => {
    createUser(req.body.user)
    .then(() => res.end())
    .catch((err) => next(errors.basicUserError(err.message, "Error on user signup")));
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
            if(user._id.equals(req.user._id)) res.json(Profile(user));
            else res.json(User(user));
        });
    })
    .catch(err => next(errors.basicUserError(err.message)));
})

.put(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.user) return res.json({});
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
    .catch((err) => next(errors.basicUserError(err.message, err.message)));
})

.delete(authenticatedRoute(true),
(req, res, next) => {
    deleteUser(req.params.userId, req.user)
    .then(() => res.end())
    .catch((error) => next(errors.basicUserError(error.message, error.message)));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

usersRouter.route('/:userId/password')

.put(authenticatedRoute(true),
(req, res, next) => {
    if(!req.body.password) return res.json({});
    if(!req.body.password.old || !req.body.password.new) return res.json({});
    else next();
},
(req, res, next) => {
    updateUserPassword(req.params.userId, req.body.password, req.user)
    .then(() => res.end())
    .catch((err) => next(errors.basicUserError(err.message, err.message)));
})

.all((req, res, next) => {
    res.status(405);
    res.end();
});

module.exports = usersRouter;
