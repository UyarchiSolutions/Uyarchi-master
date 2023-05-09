const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');

const SellerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
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
    tradeName: {
      type: String,
    },
    businessType: {
      type: String,
    },
    contactName: {
      type: String,
    },
    mobileNumber: {
      type: Number,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    mainSeller: {
      type: String,
    },
    sellerType: {
      type: String,
    },
    sellerRole: {
      type: Array,
    },
    registered: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    roleNum: {
      type: Array,
    },
    Pincode: {
      type: Number,
    }
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);
/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
SellerSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

SellerSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
const Seller = mongoose.model('Seller', SellerSchema);

module.exports = { Seller };
