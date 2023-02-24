const multer = require('multer');

const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).array('videos');

module.exports = upload;
