const router = require('express').Router();
const JWT = require('../Middlewares/JWT');
const slugify = require('slugify');
const uuid = require('uuid');
const jsonwebtoken = require('jsonwebtoken');
const mongoose = require('mongoose');


const PostSchema = require('../Models/Post');

const POST_PER_PAGE = 15;

const SLUGIFY_OPTION = {
    replacement: '-',
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
};


const GET_POSTS_PIPELINE = [
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
        $lookup: {
            from: require('../Models/Comment').collection.collectionName,
            localField: "_id",
            foreignField: "post_id",
            as: "COMMENTS"
        }
    },
    {
        $project: {
            title: 1,
            content: 1,
            slug: 1,
            posted_at: 1,
            likes: 1,
            "USER.name": 1,
            comments: { $size: "$COMMENTS" },
            liked: 1
        }
    }
];

async function getUserID(req) {
    return new Promise(resolve => {
        const secret = process.env.SECRET;
        const { ID } = req.cookies || '';
        jsonwebtoken.verify(ID, secret, (_, decoded) => {
            const user_id = decoded ? decoded.id : null;
            resolve(user_id);
        });
    });
}
// Controller For getting post list
async function getListOfPosts(req, res) {
    if (!req.params.index) return res.status(400).json({ error: 'Index Not Found' });
    let index = parseInt(req.params.index);
    if (isNaN(index)) return res.status(400).json({ error: 'Invalid Index' });

    index = (index < 1) ? 1 : index;

    const user_id = await getUserID(req);
    if (user_id) {
        GET_POSTS_PIPELINE.splice(3, 0, {
            $lookup: {
                from: require('../Models/PostLikes').collection.collectionName,
                let: {
                    abc: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$post_id", "$$abc"] },
                                    { $eq: ["$user_id", new mongoose.Types.ObjectId(user_id)] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1, value: 1 } }],
                as: "liked"
            }
        });
        GET_POSTS_PIPELINE.splice(4, 0, { $unwind: { path: "$liked", preserveNullAndEmptyArrays: true } });
    }
    const posts = await PostSchema.aggregate(GET_POSTS_PIPELINE)
        .sort({ posted_at: -1 })
        .skip((index - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .exec();
    if (user_id) {
        GET_POSTS_PIPELINE.splice(3, 2);
    }

    res.json(posts || []);
}

// Get Post List
router.get('/:index', (req, res) => {
    getListOfPosts(req, res).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Controller For getting Post By Slug
async function getPostBySlug(req, res) {
    const { slug } = req.params;
    const user_id = await getUserID(req);
    const GET_POST = [
        {
            $match: {
                slug
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
                title: 1,
                content: 1,
                slug: 1,
                posted_at: 1,
                likes: 1,
                "USER._id": 1,
                "USER.name": 1
            }
        }
    ];
    if (user_id) {
        GET_POST.push({
            $lookup: {
                from: require('../Models/PostLikes').collection.collectionName,
                let: {
                    abc: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$post_id", "$$abc"] },
                                    { $eq: ["$user_id", new mongoose.Types.ObjectId(user_id)] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1, value: 1 } }],
                as: "liked"
            }
        });
        GET_POST.push({ $unwind: { path: "$liked", preserveNullAndEmptyArrays: true } });
    }
    const posts = await PostSchema
        .aggregate(GET_POST)
        .exec();
    if (posts.length > 0) {
        const post = posts[0];
        res.json({
            post,
            me: `${post.USER._id}` === `${user_id}`
        });
    } else res.status(400).json({ error: 'Post Not Found' });
}


// Get Post By Slug
router.get('/view/:slug', (req, res) => {
    getPostBySlug(req, res)
        .catch(err => {
            console.error(err);
            res.json({ error: "Internal Server Error" })
        });
});

// Is My Post ie. is the post is created by me
router.get('/my/:id', JWT, (req, res) => {
    const { id } = req.params;
    PostSchema.findOne({ _id: id, user_id: req.user._id }, (err, post) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Database Issue'
            });
        } else {
            if (post) {
                res.json({
                    post
                });
            } else res.status(400).json({ error: 'Post Not Found' });
        }
    });
});

// Add a Post
router.post('/', JWT, (req, res) => {
    if (!req.body.title) return res.status(400).json({ error: 'Title Not Found' });
    if (!req.body.content) return res.status(400).json({ error: 'Content Not Found' });

    let slug = req.body.title.substr(0, 50);
    slug = slugify(slug, SLUGIFY_OPTION);
    PostSchema.findOne({ slug }).countDocuments().exec((err, counts) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Database Issue'
            });
        } else {
            if (counts > 0) {
                slug = slug + '-' + uuid.v1();
            }
            const post = new PostSchema({
                title: req.body.title,
                content: req.body.content,
                slug,
                user_id: req.user._id,
                posted_at: new Date(),
                likes: 0
            });
            post.save((error, post) => {
                if (post) {
                    res.json({ status: post._id, slug });
                }
                else {
                    console.error(error);
                    res.status(500).json({
                        error: 'Database Issue'
                    });
                }
            });
        }
    });
});

// UPDATE Post
router.put('/:id', JWT, (req, res) => {

    if (!req.body.title) return res.status(400).json({ error: 'Title Not Found' });
    if (!req.body.content) return res.status(400).json({ error: 'Content Not Found' });


    const post = {
        title: req.body.title,
        content: req.body.content,
    };

    PostSchema.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, post, { useFindAndModify: false }, (err, result) => {
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
                    error: 'Post Not Found'
                });
            }
        }
    });
});

// Delete Post
router.delete('/:id', JWT, (req, res) => {
    PostSchema.findOneAndDelete({ _id: req.params.id, user_id: req.user._id }, (err, result) => {
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
                    error: 'Post Not Found'
                });
            }
        }
    });
});

module.exports = router;