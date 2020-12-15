const mongo = require('mongoose');
let url = 'mongodb://localhost:27017/PostMe';

if (process.env.DB_USER) {
    url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:27017/${process.env.DB_NAME}`;
}

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
