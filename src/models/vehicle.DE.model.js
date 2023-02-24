const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');

const VehicleSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  vehicle_type: {
    type: String,
  },
  vehicle_Name: {
    type: String,
  },
  vehicle_Owner_Name: {
    type: String,
  },
  ownerShip_Type: {
    type: String,
  },
  RC_book_image: {
    type: Array,
  },
  vehicleNo: {
    type: String,
  },
  tonne_Capacity: {
    type: String,
  },
  vehicle_image: {
    type: Array,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
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
  kgsValue: {
    type: Number,
    default: 0,
  },
  extendedKg: {
    type: String,
  },
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

const assignDriveSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  vehicleID: {
    type: String,
  },
  group: {
    type: Array,
  },
  driverID: {
    type: String,
  },
  date: {
    type: String,
  },
  route: {
    type: String,
  },
  time: {
    type: Number,
  },
  created: {
    type: Date,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  groupID: {
    type: String,
  },
});

const AssignDriver = mongoose.model('assignDrive', assignDriveSchema);

const assignDriveSchemachild = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupID: {
    type: String,
  },
  assignGroupId: {
    type: String,
  },
  time: {
    type: Number,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
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

const AssignDrivechild = mongoose.model('assignDrivehistory', assignDriveSchemachild);

module.exports = { Vehicle, AssignDriver, AssignDrivechild };
