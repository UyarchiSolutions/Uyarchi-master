const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');
let date = moment().format('YYYY-MM-DD');
const setSalesPriceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  product: {
    type: String,
  },
  onlinePrice: {
    type: Number,
  },
  salesmanPrice: {
    type: Object,
  },
  oldstock: {
    type: Number,
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

setSalesPriceSchema.plugin(toJSON);
setSalesPriceSchema.plugin(paginate);
const SetSalesPrice = mongoose.model('SetSalesPrice', setSalesPriceSchema);

module.exports = SetSalesPrice;
