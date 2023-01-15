const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const vendorSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      min: 5,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pinCode: {
      type: Number,
    },
    agree: {
      type: Boolean,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.plugin(toJSON);
vendorSchema.plugin(paginate);

vendorSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const vendor = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!vendor;
};
vendorSchema.methods.isPasswordMatch = async function (password) {
  const vendor = this;
  return bcrypt.compare(password, vendor.password);
};

vendorSchema.pre('save', async function (next) {
  const customer = this;
  if (customer.isModified('password')) {
    customer.password = await bcrypt.hash(customer.password, 8);
  }
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
