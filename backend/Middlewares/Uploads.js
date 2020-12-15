const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, callback) {
        const ind = file.originalname.lastIndexOf('.');
        const ext = file.originalname.substr(ind);
        const name = uuidv4() + ext;
        callback(null, name);
    }
});

module.exports = multer({ storage });