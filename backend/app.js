require('dotenv').config();
const isProduction = (process.env.NODE_ENV === 'production');
const PORT = 4000;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
if (!isProduction) {
    console.log('Dev Mode');
    app.use(require('cors')({ credentials: true, origin: true }));
    app.use(require('errorhandler')());
}

if (!process.env.SECRET) {
    process.env.SECRET = 'thisisnotsecret';
    console.warn('.env File Not Found Taking Default values.');
}


app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('cookie-parser')());

require('./db');
app.use('/users', require('./Routers/User'));
app.use('/posts', require('./Routers/Posts'));
app.use('/comments', require('./Routers/Comments'));

app.use('/static', express.static('uploads'));

/// catch 404
app.use(function (req, res, next) {
    res.status(404);
    res.json({
        status: 'Not Found'
    });
});

app.listen(PORT, () => console.log(`Started at http://localhost:${PORT}/`));
