const router = require('express').Router();

// For Posts
router.use('/post', require('./Likes/Post'));
// For Comments
router.use('/comment', require('./Likes/Comments'));

module.exports = router;