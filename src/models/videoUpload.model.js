const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');

const videoUploadSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopId: {
    type: String,
  },
  title: {
    type: String,
  },
  video: {
    type: Array,
  },
  created: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  archive: {
    type: Boolean,
  },
});


const videoUpload = mongoose.model('videoUpload', videoUploadSchema);

module.exports = videoUpload;
