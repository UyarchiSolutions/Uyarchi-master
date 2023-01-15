const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const historyPacktypeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productPackId: {
    type: String,
  },
  date:{
    type:String,
  },
  timeBack:{
    type:Number
  },
  created:{
    type:Date
  },
  productId: {
    type: String,
  },
  onlinePrice: {
    type: Number,
  },
  salesstartPrice: {
    type: Number,
  },
  salesendPrice: {
    type: Number,
  },
  packtypeId: {
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

historyPacktypeSchema.plugin(toJSON);
historyPacktypeSchema.plugin(paginate);
const HistoryPacktype = mongoose.model('historyPacktype', historyPacktypeSchema);

module.exports = HistoryPacktype;