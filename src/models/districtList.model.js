const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const districtListSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  state: {
    type: String,
  },
  state1: {
    type: String,
  },
  Districtid: {
    type: String,
  },
  Districts: {
    type: String,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});
districtListSchema.plugin(toJSON);
districtListSchema.plugin(paginate);
const DistrictList = mongoose.model('DistrictList', districtListSchema);

module.exports = DistrictList;
