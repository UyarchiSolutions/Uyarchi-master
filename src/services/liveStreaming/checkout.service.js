const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { streamingCart } = require('../../models/liveStreaming/checkout.model');
const axios = require('axios'); //
const Dates = require('../Date.serive')

const addTocart = async (req) => {
  let shopId = req.shopId;
  let streamId = req.body.streamId;
  let cart = req.body.cart;
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId })
  console.log(value)
  if (!value) {
    value = await streamingCart.create({ cart: cart, shopId: shopId, streamId: streamId })
    await Dates.create_date(value)
  }
  else {
    value.cart = cart;
  }

  return value;
};


module.exports = {
  addTocart
};
