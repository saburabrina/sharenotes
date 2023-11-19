const express = require('express');
const router = express.Router();

const { Signup, Login }  = require('../models/userModel');
const errors = require('../lib/errors');

function User (user) {
    var User = {};
    User.name = user.name;
    User.nickname = user.nickname;
    User.email = user.email;
    return User;
};

router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', (req, res, next) => {
    if(!req.body.credentials || !req.body.credentials.password || !req.body.credentials.email) 
    next(errors.missingRequiredDataToLogin());
    next();
}, function(req, res, next){
    Login(req.body.credentials.email, req.body.credentials.password)
    .then((token) => { 
        res.cookie("jwt", token.token, {maxAge: token.expires, httpOnly: true});
        res.end();
        return;
    })
    .catch((err) => {   
        return next(errors.nonExistentUserWithGivenCredentials(req.body.credentials, err.message));
    });
});

router.post('/signup', (req, res, next) => {
    if(!req.body.user || !req.body.user.password || 
        !req.body.user.name || !req.body.user.nickname || !req.body.user.email) 
    next(errors.missingRequiredDataToSignup());
    
    next();
}, (req, res, next) => {
    Signup(req.body.user)
    .then((user) => {
        res.json(User(user));
    })
    .catch((err) => next(errors.basicUserError(err.message, "Invalid user")));
},);

module.exports = router;
