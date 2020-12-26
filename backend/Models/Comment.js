const mongoose = require('mongoose');

const Comment = mongoose.Schema({
    message: { type: String, required: true },
    posted_at: { type: Date, default: Date.now, required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Comment' },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: { type: Number, default: 0, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', Comment);