const jwt = require('jsonwebtoken');
const UserSchema = require('../Models/User');

module.exports = function (req, res, next) {
    const secret = process.env.SECRET;
    const { ID } = req.cookies;
    if (ID) {
        jwt.verify(ID, secret, (err, decoded) => {
            if (err) {
                res.status(401);
                if (err.name === 'JsonWebTokenError') {
                    res.json({
                        error: 'Invalid Key'
                    });
                } else {
                    res.json({
                        error: 'Key Expired'
                    });
                }
            } else {
                const { id } = decoded;

                UserSchema.findById(id, (err, user) => {
                    if (err || !user) {
                        res.status(401);
                        res.json({
                            error: 'Unauthorised'
                        })
                    } else {
                        req.user = user;
                        next();
                    }
                });
            }
        });
    } else {
        res.status(401);
        res.json({
            error: 'Key Not Found'
        });
    }
}