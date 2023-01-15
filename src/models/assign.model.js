const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const assignSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  menuName: {
    type: String,
  },
  Read: {
    type: Boolean,
  },
  Write: {
    type: Boolean,
  },
  Update: {
    type: Boolean,
  },
  Delete: {
    type: Boolean,
  },
  Position: {
    type: Number,
  },
  menus: {
    type: Array,
    default: [],
  },
});

assignSchema.plugin(toJSON);
assignSchema.plugin(paginate);

const Assign = mongoose.model('Assign', assignSchema);

module.exports = Assign;
