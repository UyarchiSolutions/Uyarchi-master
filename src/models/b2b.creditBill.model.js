const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const creditBillSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  orderId: {
    type: String,
  },
  shopId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  creditbillId: {
    type: String,
  },
  bill: {
    type: String,
  },
  pay_By: {
    type: String,
  },
  pay_type: {
    type: String,
  },
  upiStatus: {
    type: String,
  },
  amountPayingWithDEorSM: {
    type: String,
  },
  actionStatus: {
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
  AssignedUserId: {
    type: String,
  },
  Disputestatus: {
    type: String,
    status: 'Pending',
  },
  reasonScheduleOrDate: {
    type: String,
  },
  Schedulereason: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  fineStatus: {
    type: String,
    default: 'Pending',
  },
  fineAmt: {
    type: Number,
  },
});

const creditBill = mongoose.model('creditBill', creditBillSchema);
module.exports = creditBill;
