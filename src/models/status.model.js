const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const StatusSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productid: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  type: {
    type: String,
    default: '',
  },
});

StatusSchema.plugin(toJSON);
StatusSchema.plugin(paginate);
const Status = mongoose.model('status', StatusSchema);

module.exports = Status;
