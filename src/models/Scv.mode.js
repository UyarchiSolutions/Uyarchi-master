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
    allocationHistory: {
      type: Array,
      default: [],
    },
    allocatedScv: {
      type: String,
    },
    allocatedTime: {
      type: Date,
    },
    closeStock: {
      type: String,
      default: 'new',
    },
    closedDate: {
      type: Date,
    },
    image: {
      type: String,
    },
    cartOnDate: {
      type: String,
    },
    latestUpdateStock: {
      type: String,
    },
    partnerId: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    cartUpdateHistory: {
      type: Object,
      default: {},
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
    workingStatus: {
      type: String,
      default: 'no',
    },
    createdBy: {
      type: String,
    },
    gender: {
      type: String,
    },
    attendance: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Scv = mongoose.model('scv', SCVSchema);

const scvCustomerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNumber: {
      type: Number,
      unique: true,
    },
    password: {
      type: String,
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
    addressProof: {
      type: String,
    },
    idProof: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
scvCustomerSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

scvCustomerSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const Customer = mongoose.model('scvcustomer', scvCustomerSchema);

const SCVAttendanceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    date: {
      type: String,
    },
    history: {
      type: Array,
    },
    startTime: {
      type: String,
    },
    scvId: {
      type: String,
    },
    totalSeconds: {
      type: Number,
      default: 0,
    },
    cartId: {
      type: String,
    },
  },
  { timestamps: true }
);

const ScvAttendance = mongoose.model('scvattendance', SCVAttendanceSchema);

module.exports = {
  ScvCart,
  Scv,
  Customer,
  ScvAttendance,
};
