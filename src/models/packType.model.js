const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const packTypeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  unit: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  material: {
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
packTypeSchema.plugin(toJSON);
packTypeSchema.plugin(paginate);

const PackType = mongoose.model('packType', packTypeSchema);

module.exports = PackType;
