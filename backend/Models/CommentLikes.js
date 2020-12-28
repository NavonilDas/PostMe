const mongoose = require('mongoose');

const Likes = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    value: { type: Number, default: 1 }
}, { timestamps: true });


Likes.index({ user_id: 1, comment_id: 1 }, { unique: true });

module.exports = mongoose.model('CommentLikes', Likes);