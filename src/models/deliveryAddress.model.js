const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const deliveryAddressSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  fullName: {
    type: String,
  },
  mobileNumber: {
    type: Number,
  },
  address: {
    type: String,
  },
  addressType: {
    type: String,
    enum: ['office', 'home', 'commercial'],
  },
  landMark: {
    type: String,
  },
  Town: {
    type: String,
  },
  PinCode: {
    type: Number,
  },
  deliveryTime: {
    type: String,
  },
  DeliveryInstruction: {
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
deliveryAddressSchema.plugin(toJSON);
deliveryAddressSchema.plugin(paginate);
const DeliveryAddress = mongoose.model('deliveryAddress', deliveryAddressSchema);

module.exports = DeliveryAddress;
