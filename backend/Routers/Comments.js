const router = require('express').Router();
const JWT = require('../Middlewares/JWT');
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');


const CommentSchema = require('../Models/Comment');

function Group(comment, threads) {
    for (const thread in threads) {
        let value = threads[thread];
        if (thread.toString() === comment.parent_id.toString()) {
            value.children[comment._id] = comment;
            return;
        }

        if (value.children) {
            Group(comment, value.children);
        }
    }
}

// Get Commnets By Post ID
router.get('/:id', (req, res) => {
    const secret = process.env.SECRET;
    const { ID } = req.cookies || '';

    jsonwebtoken.verify(ID, secret, (_, decoded) => {
        const user_id = decoded ? decoded.id : '-1';
        CommentSchema.aggregate([
            {
                $match: {
                    post_id: new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: require('../Models/User').collection.collectionName,
                    localField: "user_id",
                    foreignField: "_id",
                    as: "USER"
                }
            },
            {
                $unwind: "$USER"
            },
            {
                $project: {
                    message: 1,
                    parent_id: 1,
                    posted_at: 1,
                    "USER._id": 1,
                    "USER.name": 1
                }
            },
            {
                $sort: {
                    posted_at: 1
                }
            }
        ])
            .exec()
            .then(comments => {
                let threads = {};
                for (const comment of comments) {
                    comment.children = {};
                    const parent_id = comment.parent_id;
                    if (!parent_id) {
                        threads[comment._id] = comment;
                        continue;
                    }
                    Group(comment, threads);
                }
                res.json({
                    count: comments.length,
                    comments: threads,
                    my_id: user_id
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Database Error' });
            })
    });
});

// Add Comment
router.post('/:id', JWT, (req, res) => {
    if (!req.body.message) return res.status(400).json({ error: 'Message Not Found' });
    const comment = new CommentSchema({
        message: req.body.message,
        post_id: req.params.id,
        user_id: req.user._id,
        parent_id: (req.body.parent) ? req.body.parent : null
    });
    comment.save((error, result) => {
        if (result) {
            res.json({ status: result._id });
        }
        else {
            console.error(error);
            res.status(500).json({
                error: 'Database Issue'
            });
        }
    });
});

// Update Comment
router.put('/:id', JWT, (req, res) => {
    if (!req.body.message) return res.status(400).json({ error: 'Message Not Found' });

    const comment = {
        message: req.body.message,
    };

    CommentSchema.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, comment, { useFindAndModify: false }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Database Issue'
            });
        } else {
            if (result) {
                res.json({ status: 'Done' });
            } else {
                res.status(400).json({
                    error: 'Comment Not Found'
                });
            }
        }
    });
});


// Delete Comment
router.delete('/:id', JWT, (req, res) => {
    CommentSchema.findOneAndDelete({ _id: req.params.id, user_id: req.user._id }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Database Issue'
            });
        } else {
            if (result) {
                res.json({ status: 'Done' });
            } else {
                res.status(400).json({
                    error: 'Comment Not Found'
                });
            }
        }
    });
});

module.exports = router;