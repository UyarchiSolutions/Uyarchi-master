const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const wardAssignSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  key: {
    type: String,
  },
  value: {
    type: String,
  },
  assignStatus: {
    type: String,
    default: 'Assigned',
  },
  userId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
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

const WardAssign = mongoose.model('wardAssign', wardAssignSchema);

module.exports = WardAssign;
