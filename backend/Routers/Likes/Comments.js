const router = require('express').Router();
const mongoose = require('mongoose');

const JWT = require('../../Middlewares/JWT');
const LikesSchema = require('../../Models/CommentLikes');
const CommentSchema = require('../../Models/Comment');

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


// Delete Comment Like
router.delete('/:comment_id', JWT, (req, res) => {
    let { comment_id } = req.params;

    try {
        comment_id = mongoose.Types.ObjectId(comment_id);
    } catch (_) {
        return res.status(400).json({ error: 'Invalid Comment ID' });
    }


    LikesSchema.findOneAndDelete({
        comment_id,
        user_id: req.user._id
    }, {}, (err, doc) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        const $inc = {
            likes: 0
        };
        if (doc.value === 1) $inc.likes = -1;
        else if (doc.value === -1) $inc.likes = 1;

        CommentSchema.findByIdAndUpdate(comment_id, { $inc }, { useFindAndModify: false }, (error, doc) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Database Error' });
            }
            res.json({ status: 'Done' });
        });
    });
});


// Update Comment Like
router.put('/:comment_id/:isUp', JWT, (req, res) => {
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
    if (value === 1) $inc.likes = 2;
    else $inc.likes = -2;

    const find = {
        comment_id,
        user_id: new mongoose.Types.ObjectId(req.user._id),
    };
    const conf = { useFindAndModify: false };

    LikesSchema.findOneAndUpdate(find, { value }, conf, (err, doc) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        // if prev is not same as update
        if (doc.value !== value) {
            CommentSchema.findByIdAndUpdate(comment_id, { $inc }, conf, (error, _) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Database Error' });
                }
                res.json({ status: 'Done' });
            });
        } else res.status(400).json({ error: 'Already Liked' });
    });

});


module.exports = router;