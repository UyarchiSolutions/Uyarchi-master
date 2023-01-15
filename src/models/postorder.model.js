const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const postOrderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  type: {
    type: String,
  },
  name: {
    type: String,
  },
  buyerpname: {
    type: String,
  },
  minrange: {
    type: Number,
  },
  maxrange: {
    type: Number,
  },
  minprice: {
    type: Number,
  },
  maxprice: {
    type: Number,
  },
  pdelivery: {
    type: String,
  },
  deliverylocation: {
    type: String,
  },
  buyerdeliverydate: {
    type: String,
  },
  supplierpname: {
    type: String,
  },
  stocklocation: {
    type: String,
  },
  stockposition: {
    type: String,
  },
  stockavailabilitydate: {
    type: String,
  },
  packtype: {
    type: String,
  },
  expquantity: {
    type: Number,
  },
  expprice: {
    type: Number,
  },
  paymentmode: {
    type: String,
  },
  date: {
    type: String,
  },
});
postOrderSchema.plugin(toJSON);
postOrderSchema.plugin(paginate);

const postOrder = mongoose.model('postorders', postOrderSchema);

module.exports = postOrder;
