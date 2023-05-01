const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');

const CartSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    vehicleName: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    cartName: {
      type: String,
    },
    cartLocation: {
      type: String,
    },
    image: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ScvCart = mongoose.model('scvCart', CartSchema);

const SCVSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Name: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    address: {
      type: String,
    },
    landMark: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    addreddProof: {
      type: String,
    },
    idProof: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const Scv = mongoose.model('scv', SCVSchema);

module.exports = {
  ScvCart,
  Scv,
};