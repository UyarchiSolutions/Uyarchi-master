const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const apartmentSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Strid: {
    type: String,
  },
  AName: {
    type: String,
  },
  AType: {
    type: String,
  },
  AFloor: {
    type: String,
  },
  NFlat: {
    type: String,
  },
  Alat: {
    type: String,
  },
  Along: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  Uid: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  created: {
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
  reason: {
    type: String,
  },
});

const Apartment = mongoose.model('apartment', apartmentSchema);

const shopSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Strid: {
    type: String,
  },
  SType: {
    type: String,
  },
  SName: {
    type: String,
  },
  SOwner: {
    type: String,
  },
  SCont1: {
    type: Number,
  },
  Slat: {
    type: String,
  },
  Slong: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  Uid: {
    type: String,
  },
  status: {
    type: String,
  },
  reason: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  created: {
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
  reason: {
    type: String,
  },
});

// assignSchema.plugin(toJSON);
// assignSchema.plugin(paginate);

const Shop = mongoose.model('shop', shopSchema);

const manageUserAttendanceSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Alat: {
    type: String,
  },
  Along: {
    type: String,
  },
  photoCapture: {
    type: String,
  },
  Uid: {
    type: String,
  },
  created: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
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
  baseImage: {
    type: Array,
  },
  dateIso: {
    type: String,
    default: Date.now(),
  },
});

manageUserAttendanceSchema.plugin(toJSON);
manageUserAttendanceSchema.plugin(paginate);

const ManageUserAttendance = mongoose.model('manageUserAttendance', manageUserAttendanceSchema);
const manageUserAttendanceAutoSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Alat: {
    type: String,
  },
  Along: {
    type: String,
  },
  photoCapture: {
    type: String,
  },
  Uid: {
    type: String,
  },
  created: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
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
  baseImage: {
    type: Array,
  },
});

const ManageUserAttendanceAuto = mongoose.model('manageUserAttendanceAuto', manageUserAttendanceAutoSchema);
module.exports = {
  Shop,
  Apartment,
  ManageUserAttendance,
  ManageUserAttendanceAuto,
};
