const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const usermetaSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  user_id: {
    type: String,
  },
  metaKey: {
    type: String,
  },
  metavalue: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const metaUsers = mongoose.model('mUsers', usermetaSchema);

module.exports = metaUsers;
