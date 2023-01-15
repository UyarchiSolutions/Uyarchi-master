const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');

const wardSchema = mongoose.Schema(
  {
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
    ward: {
      type: String,
    },
    zoneId: {
      type: String,
    },
    wardsql: {
      type: String,
    },
    wardNo: {
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
  },
  {
    timestamp: true,
  }
);

wardSchema.plugin(toJSON);
wardSchema.plugin(paginate);
const Ward = mongoose.model('Ward', wardSchema);

module.exports = Ward;
