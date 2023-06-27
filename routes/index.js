const express = require('express');
const router = express.Router();

const Users = require('../models/user');
const utils = require('../lib/utils');

function User(user) {
    var User = {};
    User.name = user.name;
    User.nickname = user.nickname;
    User.email = user.email;
    return User;
}

function Credentials(cred) {
    var Cred = {};
    Cred.email = cred.email;
    Cred.password = cred.password;
    return Cred;
}

router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', (req, res, next) => {
    if(!req.body.credentials || !req.body.credentials.password || !req.body.credentials.email) next({ 
        status: 200,
        clientMsg: "Invalid Credentials", 
        message: "Missing required data to login"
    });
    next();
}, function(req, res, next){
    var cred = Credentials(req.body.credentials);
    Users.findOne({ email: cred.email })
    .then((user) => { 
        var err = { 
            status: 200,
            clientMsg: "Authentication Failed! Check your credentials.", 
            message: "Inexistent user with those credentials",
            value: req.body.credentials
        }

        if (!user) {
            err.message += ": email";
            next(err);
        }

        const isCorrectPassword = utils.isCorrectPassword(cred.password, user.hash, user.salt);
        
        if (isCorrectPassword) {
            const tokenObject = utils.issueJWT(user);
            res.cookie("jwt", tokenObject.token, {maxAge: tokenObject.expires, httpOnly: true});
            res.end();
        } else {
            err.message += ": password";
            next(err);
        }
    })
    .catch((err) => {   
        next(err);
    });
});

router.post('/signup', (req, res, next) => {
    if(!req.body.user || !req.body.user.password || !Users.isValid(req.body.user)) next({ 
        status: 200,
        clientMsg: "Invalid User", 
        message: "Missing required data to create user"
    });
    next();
}, (req, res, next) => {
    var user = User(req.body.user);
    [user.salt, user.hash] = utils.generatePassword(req.body.user.password);

    Users.create(user)
    .then((user) => {
        res.json(User(req.body.user));
    },(err) => next(err))
    .catch((err) => next(err));
},);

module.exports = router;
