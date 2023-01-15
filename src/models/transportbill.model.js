const mongoose = require('mongoose');
const { v4, stringify } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const transportbill = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  billType: {
    type: String,
  },
  billAmount: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const transportbillnow = mongoose.model('transportbill', transportbill);

module.exports = transportbillnow;
