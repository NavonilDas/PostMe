const router = require('express').Router();
const mongoose = require('mongoose');

const JWT = require('../../Middlewares/JWT');
const LikesSchema = require('../../Models/Likes');
const PostSchema = require('../../Models/Post');


// Like/Dislike Post 
router.post('/post/:post_id/:isUp', JWT, (req, res) => {
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

    console.log($inc);

    like.save((err, _) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Like Already Exist' });
            }
            console.error(err);
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



module.exports = router;