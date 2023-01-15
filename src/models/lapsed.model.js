const mongoose = require('mongoose');
const { v4 } = require('uuid');

const lapsedSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopId: {
    type: String,
  },
  date: {
    type: String,
  },
  deleivery: {
    type: String,
  },
  timeSlot: {
    type: String,
  },
  Amt: {
    type: Number,
  },
  created: {
    type: Date,
  },
  lapsedStatus: {
    type: String,
  },
  time: {
    type: Number,
  },
  shoporderId: {
    type: String,
  },
});

const Lapsed = mongoose.model('lapsed', lapsedSchema);

module.exports = Lapsed;
