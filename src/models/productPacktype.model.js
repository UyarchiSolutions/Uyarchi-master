const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const productPacktypeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
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
  show:{
    type:Boolean,
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

productPacktypeSchema.plugin(toJSON);
productPacktypeSchema.plugin(paginate);
const ProductPacktype = mongoose.model('productPacktype', productPacktypeSchema);

module.exports = ProductPacktype;