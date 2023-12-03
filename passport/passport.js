const passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var AnonymousStrategy = require('passport-anonymous').Strategy;
var User = require('../models/user');

var options = {
    secretOrKey: process.env.PUB_KEY,
    algorithms: ['RS256'],
    jwtFromRequest: (req) => {
        var token = null;
        if(req && req.cookies) token = req.cookies['jwt'];
        return token;
    }
};
  
module.exports.setupStrategies = (passport) => {
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        User.findById(jwt_payload.sub)
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {
            return done(err, false);
        });
    }));

    passport.use(new AnonymousStrategy());
}

module.exports.authenticatedRoute = (isAuthenticated) => { 
    if(isAuthenticated) return passport.authenticate('jwt', { session: false });
    if(isAuthenticated === undefined) return passport.authenticate(['jwt', 'anonymous' ], { session: false });
    else return {};
};
