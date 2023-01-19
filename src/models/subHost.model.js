const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { roles } = require('../config/roles');
const { v4 } = require('uuid');

const subHostSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Name: {
    type: String,
  },
  mail: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  phoneNumber: {
    type: Number,
    unique: true,
  },
  role: {
    type: String,
  },
  password: {
    type: String,
  },
  created: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

subHostSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

subHostSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
const SubHost = mongoose.model('subHost', subHostSchema);

module.exports = SubHost;
