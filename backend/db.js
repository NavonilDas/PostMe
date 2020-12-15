const mongo = require('mongoose');
let url = process.env.DB_URL || 'mongodb://mongo:27017/PostMe';

mongo.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    (err) => {
        if (!err) {
            console.log('MongoDB connection succeeded.');
        }
        else {
            console.error('Error in DB connection : ');
            console.error(err);
        }
    });

module.exports = mongo;
