const multer = require('multer');
const path = require('path');

let counts = 0;
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(__dirname, '../../public/images/jobresume'));
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    counts++;
    //console.log(ext);
    cb(null, Date.now() + counts.toString() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    ) 
    { // check file type to be pdf, doc, or docx
      callback(null, true);
              } else {
                callback(null, false); // else fails
              }
  },
  limits: {
    fileSize: 5024 * 5024 * 5,
  },
});

module.exports = upload;
