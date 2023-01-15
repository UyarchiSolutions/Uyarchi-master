const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const zoneSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  district: {
    type: String,
  },
  zone: {
    type: String,
  },
  districtId: {
    type: String,
  },
  zoneCode: {
    type: String,
  },
  sqlZoneId: {
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
});
zoneSchema.plugin(toJSON);
zoneSchema.plugin(paginate);
const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
