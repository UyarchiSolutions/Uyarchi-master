const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const RaisedUnBilledSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  raised_Amt: {
    type: Number,
  },
  raisedBy: {
    type: String,
  },
  supplierId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const RaisedUnBilled = mongoose.model('supplierraisedunbilled', RaisedUnBilledSchema);

const RaisedUnBilledHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  raised_Amt: {
    type: Number,
  },
  supplierId: {
    type: String,
  },
  raisedId: {
    type: String,
  },
  raisedBy: {
    type: String,
  },
  paidStatus:{
    type:String,
    default:"Pending",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const RaisedUnBilledHistory = mongoose.model('supplierraisedunbilledhistory', RaisedUnBilledHistorySchema);

module.exports = { RaisedUnBilled, RaisedUnBilledHistory };
