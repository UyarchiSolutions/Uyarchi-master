const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const cartManagementSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
      Enum: ['4 Wheeler', '3 Wheeler', '2 Wheeler'],
    },
    cartNumber: {
      type: String,
    },
    image: {
      type: String,
    },
    age: {
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
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);
cartManagementSchema.plugin(toJSON);
cartManagementSchema.plugin(paginate);
const CartManagement = mongoose.model('Cart', cartManagementSchema);

module.exports = CartManagement;
