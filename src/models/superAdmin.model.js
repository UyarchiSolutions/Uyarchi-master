const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const bankSchema = mongoose.Schema({
  _id: false,
  bankName: {
    type: String,
  },
  branch: {
    type: String,
  },
  ifsc: {
    type: String,
  },
});

const superAdminSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
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
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'admin',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    whatsapp_no: {
      type: Number,
    },
    Landline: {
      type: Number,
    },
    Adress1: {
      type: String,
    },
    Adress2: {
      type: String,
    },
    Pincode: {
      type: Number,
    },
    idProofNo: {
      type: String,
    },
    idProof: {
      type: String,
    },
    addressProofNumber: {
      type: String,
    },
    addressProof: {
      type: String,
    },
    bioData: {
      type: String,
    },
    bankDetails: [bankSchema],
    active: {
      type: Boolean,
    },
    archive: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
superAdminSchema.plugin(toJSON);
superAdminSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
superAdminSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
superAdminSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

superAdminSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdmin;
