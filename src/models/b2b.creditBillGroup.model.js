const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const creditBillGroupSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  AssignedUserId: {
    type: String,
  },
  assignedDate: {
    type: String,
  },
  assignedTime: {
    type: String,
  },
  Orderdatas: {
    type: Array,
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  receiveStatus: {
    type: String,
    default: 'Pending',
  },
  disputeAmount: {
    type: Number,
  },
  fineStatus: {
    type: String,
    default: 'Pending',
  },
  Disputestatus: {
    type: String,
  },
  finishDate: {
    type: Date,
  },
});

const creditBillGroup = mongoose.model('creditBillGroup', creditBillGroupSchema);
module.exports = creditBillGroup;
