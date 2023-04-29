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
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  marriage_status: {
    type: String,
    required: true,
  },
  skills: {
    type: Array,
    default: [],
  },
});

const Demo = mongoose.model('Demo', DemoSchema);

module.exports = Demo;
