const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const DemoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  userName: {
    type: String,
  },
  mail: {
    type: String,
  },
  dob: {
    type: String,
  },
  gender: {
    type: String,
  },
  phone: {
    type: Number,
  },
  password: {
    type: String,
  },
  marriage_status: {
    type: String,
  },
  skills: {
    type: Array,
    default: [],
  },
});

const Demo = mongoose.model('Demo', DemoSchema);

module.exports = Demo;
