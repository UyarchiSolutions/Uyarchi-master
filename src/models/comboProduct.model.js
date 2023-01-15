const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const productComboSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    comboTitle: {
      type: String,
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    product: {
      type: String,
    },
    quantity: {
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
  },
  {
    timestamps: true,
  }
);

productComboSchema.plugin(toJSON);
productComboSchema.plugin(paginate);
const ProductCombo = mongoose.model('ProductCombo', productComboSchema);

module.exports = ProductCombo;
