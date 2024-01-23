const express = require('express');
const router = express.Router();

const { login }  = require('../models/userModel');
const errors = require('../lib/errors');

router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    next();
});

router.get('/', function(req, res, next) {
    res.redirect('/notes');
});

router.post('/login', (req, res, next) => {
    if(!req.body.credentials || !req.body.credentials.password || !req.body.credentials.email) 
    next(errors.missingRequiredDataToLogin());
    next();
}, function(req, res, next){
    login(req.body.credentials.email, req.body.credentials.password)
    .then((token) => { 
        res.cookie("jwt", token.token, {maxAge: token.expires, httpOnly: true});
        res.end();
        return;
    })
    .catch((err) => {   
        return next(errors.nonExistentUserWithGivenCredentials(req.body.credentials, err.message));
    });
});

module.exports = router;
