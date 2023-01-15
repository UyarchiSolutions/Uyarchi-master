const mongoose = require('mongoose');
const { v4 } = require('uuid');

const Adj_bill_historySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  AdjBill_Id: {
    type: String,
  },
  shopId: {
    type: String,
  },
  un_Billed_amt: {
    type: Number,
  },
  payment_method: {
    type: String,
  },
  created: {
    type: Date,
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
});

const Adj_bill_history = mongoose.model('AdjbillHistories', Adj_bill_historySchema);

module.exports = Adj_bill_history;
