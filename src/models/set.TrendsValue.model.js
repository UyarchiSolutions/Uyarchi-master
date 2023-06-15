const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

let datenow = moment(new Date()).format('DD-MM-YYYY');
//console.log(datenow);

const setTrendsValueSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    productid: {
      type: String,
    },
    preferredQuantity: {
      type: Number,
    },
    preferredUnit: {
      type: String,
    },
    weight: {
      type: String,
    },
    rate: {
      type: String,
    },
    ProductName: {
      type: String,
    },
    streetid: {
      type: String,
    },
    shopid: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    date: {
      type: String,
      default: datenow,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);
setTrendsValueSchema.plugin(toJSON);
setTrendsValueSchema.plugin(paginate);
const SetTrends = mongoose.model('TrendValues', setTrendsValueSchema);

module.exports = SetTrends;
