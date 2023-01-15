const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const hsnSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  HSN_entrolment: {
    type: String,
  },
  HSN_code: {
    type: String,
  },
  HSN_Description: {
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

hsnSchema.plugin(toJSON);
hsnSchema.plugin(paginate);
const HSN = mongoose.model('HSN', hsnSchema);

module.exports = HSN;
