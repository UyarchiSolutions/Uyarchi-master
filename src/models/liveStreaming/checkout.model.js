const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');
const { roles } = require('../../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');

const streamingCartschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  streamId: {
    type: String,
  },
  cart: {
    type: Array,
  },
  shopId: {
    type: String,
  },

});

const streamingCart = mongoose.model('streamingcart', streamingCartschema);

module.exports = { streamingCart };
