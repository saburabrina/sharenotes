const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { emailREGEX } = require('../../lib/utils');

const userSchema = new Schema({
    name: {
        type: String,
        required: true, 
        trim: true
    }, 
    nickname: {
        type: String,
        required: true,
        trim: true
    },
    bio : {
        type: String,
        default: "Hi! :)",
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: emailREGEX
    },
    hash: {
        type: String,
        required: true
    }, 
    salt: {
        type: String,
        required: true
    }, 
    deleted : {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;