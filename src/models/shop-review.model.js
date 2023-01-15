const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const Shop_Review_Schema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopId: {
    type: String,
  },
  Rating: {
    type: Number,
  },
  Review: {
    type: String,
  },
  Name: {
    type: String,
  },
  Mail: {
    type: String,
  },
  MobileNumber: {
    type: Number,
  },
  created: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default:false
  },
});

const ShopReview = mongoose.model('ShopReview', Shop_Review_Schema);

module.exports = ShopReview;