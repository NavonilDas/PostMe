const mongoose = require('mongoose');


const Post = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    posted_at: { type: Date, required: true },
    likes: { type: Number, default: 0, required: true }
});

module.exports = mongoose.model('Post', Post);