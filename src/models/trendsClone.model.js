const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { v4 } = require('uuid');

const trendsCloneSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopid: {
    type: String,
  },
  streetId: {
    type: String,
  },
  Uid: {
    type: String,
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
  product: {
    type: Array,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  wardId: {
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
  timestamps: {
    type: Date,
  },
});

trendsCloneSchema.plugin(toJSON);
trendsCloneSchema.plugin(paginate);
const TrendsClone = mongoose.model('TrendsClone', trendsCloneSchema);

module.exports = TrendsClone;
