const express = require('express');
const router = express.Router();

const { login }  = require('../models/users/');
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
    if(!req.body.credentials || !req.body.credentials.password || !req.body.credentials.identifier) 
    next(errors.missingRequiredData());
    else next();
}, function(req, res, next){
    login(req.body.credentials.identifier, req.body.credentials.password)
    .then((token) => { 
        res.cookie("jwt", token.token, { maxAge: token.expires, httpOnly: true });
        res.end();
    })
    .catch((err) => next(err));
});

router.get('/logout', (req, res, next) => {
    res.clearCookie("jwt", { httpOnly: true });
    res.end();
});

module.exports = router;
