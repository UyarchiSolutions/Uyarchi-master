const multer = require('multer');
const path = require('path');

let counts = 0;
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(__dirname, '../../public/images/shop'));
  },
  filename: function (req, file, cb) {
    //console.log(file, 'sdfsdfsdfsdfsdf');
    let ext = path.extname(file.originalname);
    counts++;
    cb(null, Date.now() + counts.toString() + ext);
  },
});

// const uploadImage = multer({
//     storage: storage,
//     fileFilter: function (req, file, callback) {
//       if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
//         callback(null, true);
//       } else {
//         //console.log('Only png And Jpg file supported!');
//         callback(null, false);
//       }
//     },
//     limits: {
//       fileSize: 3024 * 3024 *10,
//     },
//   });

const multerFilter = (req, file, cb) => {
  // //console.log(file,"sdfsdfsdf")
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Not an image! Please upload only images.', false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

module.exports = upload;
