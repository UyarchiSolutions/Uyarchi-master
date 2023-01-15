const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const cutomerSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      private: true, // used by the toJSON plugin
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
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

cutomerSchema.plugin(toJSON);
cutomerSchema.plugin(paginate);

cutomerSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const customer = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!customer;
};
cutomerSchema.methods.isPasswordMatch = async function (password) {
  const customer = this;
  return bcrypt.compare(password, customer.password);
};

cutomerSchema.pre('save', async function (next) {
  const customer = this;
  if (customer.isModified('password')) {
    customer.password = await bcrypt.hash(customer.password, 8);
  }
  next();
});

const Customer = mongoose.model('Customer', cutomerSchema);

module.exports = Customer;
