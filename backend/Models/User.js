const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    // phone: { type: Number, required: true },
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    salt: { type: String, required: true },
    profile: { type: String, required: false }, // Profile Image
});

User.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.password === hash;
};

User.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    this.accountType = 'email';
};

User.methods.setToken = function () {
    // TODO: Fix expiry Date
    const expire = new Date();
    expire.setTime(expire.getTime() + 30 * 24 * 60 * 60 * 1000); // 30days

    let token = jwt.sign({
        id: this._id,
        exp: parseInt(expire.getTime() / 1000),
    }, process.env.SECRET);
    this.session = token;
    return token;
}

module.exports = mongoose.model('User', User);
