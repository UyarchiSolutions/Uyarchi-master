const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const districtSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  district: {
    type: String,
  },
  visible: {
    type: Boolean,
    //    Enum:['true','false'],
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
districtSchema.plugin(toJSON);
districtSchema.plugin(paginate);
const District = mongoose.model('District', districtSchema);

module.exports = District;
