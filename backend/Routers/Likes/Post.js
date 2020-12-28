const router = require('express').Router();
const mongoose = require('mongoose');

const JWT = require('../../Middlewares/JWT');
const LikesSchema = require('../../Models/PostLikes');
const PostSchema = require('../../Models/Post');


// Like/Dislike Post 
router.post('/:post_id/:isUp', JWT, (req, res) => {
    let { post_id, isUp } = req.params;

    try {
        post_id = mongoose.Types.ObjectId(post_id);
    } catch (_) {
        return res.status(400).json({ error: 'Invalid Post ID' });
    }

    const value = (isUp === 'up') ? 1 : -1;
    const $inc = {
        likes: 0
    };
    if (value === 1) $inc.likes = 1;
    else $inc.likes = -1;

    const like = new LikesSchema({
        post_id,
        user_id: req.user._id,
        value
    });

    like.save((err, _) => {
        if (err) {
            console.error(err);
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Like Already Exist' });
            }
            return res.status(500).json({ error: 'Database Error' });
        }
        PostSchema.findByIdAndUpdate(post_id, { $inc }, { useFindAndModify: false }, (error, doc) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Database Error' });
            }
            res.json({ status: 'Done' });
        });
    });
});

// Delete Post Like
router.delete('/:post_id', JWT, (req, res) => {
    let { post_id } = req.params;

    try {
        post_id = mongoose.Types.ObjectId(post_id);
    } catch (_) {
        return res.status(400).json({ error: 'Invalid Post ID' });
    }


    LikesSchema.findOneAndDelete({
        post_id,
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

        PostSchema.findByIdAndUpdate(post_id, { $inc }, { useFindAndModify: false }, (error, doc) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Database Error' });
            }
            res.json({ status: 'Done' });
        });
    });
});

// Update Post Like
router.put('/:post_id/:isUp', JWT, (req, res) => {
    let { post_id, isUp } = req.params;

    try {
        post_id = mongoose.Types.ObjectId(post_id);
    } catch (_) {
        return res.status(400).json({ error: 'Invalid Post ID' });
    }

    const value = (isUp === 'up') ? 1 : -1;
    const $inc = {
        likes: 0
    };
    if (value === 1) $inc.likes = 2;
    else $inc.likes = -2;

    const find = {
        post_id,
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
            PostSchema.findByIdAndUpdate(post_id, { $inc }, conf, (error, _) => {
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