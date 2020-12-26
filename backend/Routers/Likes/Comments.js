const router = require('express').Router();
const mongoose = require('mongoose');

const JWT = require('../../Middlewares/JWT');
const LikesSchema = require('../../Models/Likes');
const CommentSchema = require('../Models/Comment');

// Like/Dislike comment 
router.post('/:comment_id/:isUp', JWT, (req, res) => {
    let { comment_id, isUp } = req.params;

    try {
        comment_id = mongoose.Types.ObjectId(comment_id);
    } catch (_) {
        return res.status(400).json({ error: 'Invalid Comment ID' });
    }

    const value = (isUp === 'up') ? 1 : -1;
    const $inc = {
        likes: 0
    };
    if (value === 1) $inc.likes = 1;
    else $inc.likes = -1;

    const like = new LikesSchema({
        comment_id,
        user_id: req.user._id,
        value
    });

    like.save((err, _) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Like Already Exist' });
            }
            console.error(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        CommentSchema.findByIdAndUpdate(comment_id, { $inc }, { useFindAndModify: false }, (error, doc) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Database Error' });
            }
            res.json({ status: 'Done' });
        });
    });
});


module.exports = router;