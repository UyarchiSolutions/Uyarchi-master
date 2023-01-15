const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const mangeScvOrders = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    ordersId: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    Date: {
      type: Date,
    },
    streetId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['paching', 'pending', 'loading'],
    },
    postedBy: {
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

mangeScvOrders.plugin(toJSON);
mangeScvOrders.plugin(paginate);
const ManageSCV = mongoose.model('ManageScvOrders', mangeScvOrders);

module.exports = ManageSCV;
