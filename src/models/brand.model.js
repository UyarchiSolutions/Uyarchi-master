const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const brandSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  category: {
    type: String,
  },
  subcategory: {
    type: String,
  },
  brandname: {
    type: String,
  },
  image: {
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

brandSchema.plugin(toJSON);
brandSchema.plugin(paginate);

const brand = mongoose.model('brands', brandSchema);

module.exports = brand;
