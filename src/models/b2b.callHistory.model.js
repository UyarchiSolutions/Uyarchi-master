const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');
// //console.log(moment().format('hh:mm:ss '))
const callHistorySchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  userId: {
    type: String,
  },
  TimeofCall: {
    type: String,
  },
  callStatus: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lang: {
    type: Number,
  },
  orderedStatus: {
    type: String,
  },
  reason: {
    type: String,
  },
  calledBy: {
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
  shopId: {
    type: String,
  },
  historytime: {
    type: String,
  },
  date: {
    type: String,
  },
  calldate: {
    type: String,
  },
  time: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  noOfCalls: {
    type: Number,
    default: 0,
  },
  reason: {
    type: String,
  },
  select: {
    type: String,
  },
  lapsed: {
    type: Boolean,
    default: false,
  },
  selectStatus: {
    type: String,
  },
  type: {
    type: String,
  },
  sortTime: {
    type: Number,
  },
  lapsedOrder: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: String,
  },
  
});

const callHistory = mongoose.model('callHistory', callHistorySchema);

module.exports = callHistory;
