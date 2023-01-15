const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');
const assignSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  type: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  productId: {
    type: String,
  },
  date: {
    type: String,
    // default: moment().format('DD-MM-yyy'),
  },
  time: {
    type: String,
    // default: moment().format('h:mm a'),
  },
  created: {
    type: Date,
    // default: moment().format('Hmm'),
  },
  usablestockId: {
    type: String,
  },
});

assignSchema.plugin(toJSON);
assignSchema.plugin(paginate);

const AssignStock = mongoose.model('AssignStock', assignSchema);

module.exports = AssignStock;
