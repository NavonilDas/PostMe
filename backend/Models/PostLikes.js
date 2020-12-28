const mongoose = require('mongoose');

const Likes = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    value: { type: Number, default: 1 }
}, { timestamps: true });


Likes.index({ user_id: 1, post_id: 1 }, { unique: true });

module.exports = mongoose.model('PostLikes', Likes);