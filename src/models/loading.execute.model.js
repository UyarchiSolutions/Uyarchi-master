const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const loadingExecuteSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    scvId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    session: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Hold', 'Received'],
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
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);

loadingExecuteSchema.plugin(toJSON);
loadingExecuteSchema.plugin(paginate);
const Loading = mongoose.model('LoadingExecute', loadingExecuteSchema);

module.exports = Loading;
