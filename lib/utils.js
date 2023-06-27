const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../config/config');

var isCorrectPassword = (password, hash, salt) => {
    var verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

var generatePassword = (password) => {
    var salt = crypto.randomBytes(32).toString('hex');
    var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return [salt, hash];
}

function issueJWT(user) {
    const payload = {
      sub: user._id,
      iat: Date.now()
    };
    
    const expiresIn = '4000';
    const signedToken = jsonwebtoken.sign(payload, config.privateKey, { expiresIn: expiresIn, algorithm: 'RS256' });
    
    return {
      token: signedToken,
      expires: expiresIn
    }
}

module.exports.isCorrectPassword = isCorrectPassword;
module.exports.generatePassword = generatePassword;
module.exports.issueJWT = issueJWT;