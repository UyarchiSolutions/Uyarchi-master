const mongoose = require('mongoose');
const { v4 } = require('uuid');

const customerIssuesSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  productName: {
    type: String,
  },
  quantity: {
    type: String,
  },
  price: {
    type: Number,
  },
  total: {
    type: Number,
  },
  issue: {
    type: String,
  },
  Type: {
    type: String,
  },
  editQty: {
    type: String,
  },
  description: {
    type: String,
  },
  created: {
    type: Date,
  },
  shopId: {
    type: String,
  },
  customerId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
});

const CustomeIssues = mongoose.model('customerIssues', customerIssuesSchema);

module.exports = CustomeIssues;
