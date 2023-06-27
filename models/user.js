const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true, 
        trim: true
    }, 
    nickname: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    },
    hash: String, 
    salt: String
}, {
    timestamps: true
});

userSchema.statics.isValid = (user) => {
    if(!user.name || !user.nickname || !user.email) return false;
    return true;
}

var UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;