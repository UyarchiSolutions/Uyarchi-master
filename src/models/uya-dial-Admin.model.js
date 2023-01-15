const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');

const Uyar_Dial_AdminSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  mobile: {
    type: Number,
    limit: 10,
    min: 10,
    max: 10,
    required: true,
  },
  password: {
    type: String,
    required: true,
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

const Uyar_Admin = mongoose.model('uyarAdmin', Uyar_Dial_AdminSchema);

module.exports = Uyar_Admin;
