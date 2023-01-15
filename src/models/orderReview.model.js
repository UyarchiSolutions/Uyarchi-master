const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const orderReviewSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  orderId: {
    type: String,
  },
  rating: {
    type: Number,
  },
  userId: {
    type: String,
  },
  comment: {
    type: String,
  },
  shopId: {
    type: String,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: "Pending"
  },
  show: {
    type: Boolean,
    default: false,
  },
  reply: {
    type: String,
  },
  replyDate: {
    type: Date,

  }
});

const OrderReview = mongoose.model('orderReview', orderReviewSchema);

module.exports = OrderReview;
