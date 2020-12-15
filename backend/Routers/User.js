const router = require('express').Router();

const UserSchema = require('../Models/User');
const JWT = require('../Middlewares/JWT');
const Uploads = require('../Middlewares/Uploads');

// Check Wether Username is already Taken or not
router.post('/check/username', (req, res) => {
    if (!req.body.username) return res.status(400).json({ error: 'Username Not Found' });

    UserSchema.findOne({ username: req.body.username.toLowerCase() }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error!' })
        }
        if (result) {
            res.json({ found: true });
        } else {
            res.json({ found: false });
        }
    });

});


// Signup User needs to verify otp
router.post('/signup', Uploads.single('profile'), (req, res) => {
    if (!req.body.email) return res.status(400).json({ error: 'Email Not Found' });
    // if (!req.body.phone) return res.status(400).json({ error: 'Phone Number Not Found' });
    if (!req.body.password) return res.status(400).json({ error: 'Password Not Found' });
    if (!req.body.username) return res.status(400).json({ error: 'Username Not Found' });
    if (!req.body.name) return res.status(400).json({ error: 'Name Not Found' });

    const user = new UserSchema({
        email: req.body.email,
        // phone: req.body.phone,
        username: req.body.username.toLowerCase(),
        name: req.body.name,
        profile: (req.file) ? req.file.filename : null,
    });
    user.setPassword(req.body.password);
    user.save((err, result) => {
        if (result) {
            res.json({ id: result._id });
        } else {
            if (err.code === 11000) {
                res.status(400).json({ error: 'Username Already Available' });
            } else {
                res.status(500).json({ error: 'Database Error' });
                console.error(err);
            }
        }
    });

});

// Verify user session key
router.post('/verify', JWT, (req, res) => {
    res.json({
        username: req.user.username
    });
});

// User Login returns session key
router.post('/login', (req, res) => {
    if (!req.body.password) return res.status(400).json({ error: 'Password Not Found' });
    if (!req.body.username) return res.status(400).json({ error: 'Username Not Found' });

    UserSchema.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Database Issue'
            });
        } else {
            if (user && user.validPassword(req.body.password)) {
                const token = user.setToken();
                user.save((err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Database Error!' })
                    }
                    if (result) {
                        res.json({ status: token });
                    } else {
                        res.status(401).json({ status: 'User Not Found' });
                    }
                })
            } else {
                res.status(401).json({
                    error: 'Username or Password Not match!'
                });
            }
        }
    });

});

// Update User For Edit Profile
router.put('/', Uploads.single('profile'), JWT, (req, res) => {
    if (!req.body.email) return res.status(400).json({ error: 'Email Not Found' });
    if (!req.body.password) return res.status(400).json({ error: 'Password Not Found' });
    if (!req.body.name) return res.status(400).json({ error: 'Name Not Found' });

    req.user.email = req.body.email;
    req.user.name = req.body.name;

    if (req.file) {
        req.user.profile = req.file.filename;
    }

    req.user.save((err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error!' })
        }
        if (result) {
            res.json({ status: 'Done' });
        } else {
            res.status(400).json({ status: 'User Not Found' });
        }
    });
});

module.exports = router;