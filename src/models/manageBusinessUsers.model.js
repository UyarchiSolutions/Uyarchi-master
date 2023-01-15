const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { email } = require('../config/config');
const { toJSON, paginate } = require('./plugins');

const manageBusinessUsersSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  ward: {
    type: String,
  },
  uname: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  whnumber: {
    type: Number,
  },
  lannumber: {
    type: Number,
  },
  address: {
    type: String,
  },
  addresslinetwo: {
    type: String,
  },
  pinCode: {
    type: Number,
  },
  idproofno: {
    type: String,
  },
  idproof: {
    type: String,
  },
  addproof: {
    type: String,
  },
  addsproof: {
    type: String,
  },
  biodata: {
    type: String,
  },
  roletype: {
    type: String,
  },
  bankname: {
    type: String,
  },
  branch: {
    type: String,
  },
  accno: {
    type: String,
  },
  ifsc: {
    type: String,
  },
  role: {
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

manageBusinessUsersSchema.plugin(toJSON);
manageBusinessUsersSchema.plugin(paginate);
const ManageBusinessUser = mongoose.model('manageBusinessUsers', manageBusinessUsersSchema);

const superAdminAssignWardMember = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  ward: {
    type: String,
    default: ' ',
  },
  phone: {
    type: Number,
    default: '',
  },
  whnumber: {
    type: Number,
    default: null,
  },
  uname: {
    type: String,
    default: '',
  },
  roletype: {
    type: String,
    default: null,
  },
  pinCode: {
    type: Number,
  },
  lannumber: {
    type: Number,
  },
  ifsc: {
    type: String,
    default: '',
  },
  idproofno: {
    type: String,
  },
  idproof: {
    type: String,
  },
  email: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  biodata: {
    type: String,
    default: '',
  },
  bankname: {
    type: String,
    default: '',
  },
  addsproof: {
    type: String,
    default: '',
  },
  addresslinetwo: {
    type: String,
    default: '',
  },
  address: {
    type: String,
  },
  addproof: {
    type: String,
    default: '',
  },
  accno: {
    type: String,
    default: '',
  },
});

superAdminAssignWardMember.plugin(toJSON);
superAdminAssignWardMember.plugin(paginate);
const SuperAdminAssignWardMember = mongoose.model('SuperAdminwardAssign', superAdminAssignWardMember);

module.exports = { ManageBusinessUser, SuperAdminAssignWardMember };
