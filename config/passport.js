var JwtStrategy = require('passport-jwt').Strategy;
var User = require('../models/user');
const config = require('./config');

var options = {
    secretOrKey: config.publicKey,
    algorithms: ['RS256'],
    jwtFromRequest: (req) => {
        var token = null;
        if(req && req.cookies) token = req.cookies['jwt'];
        return token;
    }
};
  
module.exports = (passport) => 
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
