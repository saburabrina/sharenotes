const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

const emailREGEX = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

function getDBURL () { 
    return 'mongodb://'+ process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB_NAME
};

function isCorrectPassword(password, hash, salt) {
    var verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

function generatePassword (password) {
    password = password.toString();
    
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
    const signedToken = jsonwebtoken.sign(payload, process.env.PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    
    return {
      token: signedToken,
      expires: expiresIn
    }
}

module.exports.emailREGEX = emailREGEX;
module.exports.getDBURL = getDBURL;
module.exports.isCorrectPassword = isCorrectPassword;
module.exports.generatePassword = generatePassword;
module.exports.issueJWT = issueJWT;