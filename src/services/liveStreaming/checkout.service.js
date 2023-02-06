const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { streamingCart, streamingOrder, streamingorderProduct, streamingorderPayments } = require('../../models/liveStreaming/checkout.model');
const axios = require('axios'); //
const Dates = require('../Date.serive')
const paymentgatway = require('../paymentgatway.service');

const addTocart = async (req) => {
  let shopId = req.shopId;
  let streamId = req.body.streamId;
  let cart = req.body.cart;
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } })
  console.log(value)
  if (!value) {
    value = await streamingCart.create({ cart: cart, shopId: shopId, streamId: streamId })
    await Dates.create_date(value)
  }
  else {
    value.cart = cart;
    value.save();
  }

  return value;
};
const get_addTocart = async (req) => {
  let shopId = req.shopId;
  let streamId = req.query.streamId;
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } })
  return value;
};
const confirmOrder_razerpay = async (shopId, body) => {
  let orders;
  let streamId = body.OdrerDetails.cart;
  console.log(body)
  console.log(streamId)
  if (body.PaymentDatails != null) {
    let payment = await paymentgatway.verifyRazorpay_Amount(body.PaymentDatails);
    let collectedAmount = payment.amount / 100
    let collectedstatus = payment.status;
    if (collectedstatus == 'captured' && collectedAmount == body.OdrerDetails.Amount) {
      let cart = await streamingCart.findById(streamId);
      if (!cart || cart.status != 'ordered') {
        throw new ApiError(httpStatus[404], 'cart not found 🖕');
      }
      let orders = await addstreaming_order(shopId, body, cart, collectedAmount);
      let paymantss = await add_odrerPayment(shopId, body, orders, payment);
      cart.cart.forEach(async (e) => {
        await addstreaming_order_product(shopId, e, orders)
      });
      cart.status = "ordered";
      cart.save();
      return orders
    }
  }
};

const addstreaming_order = async (shopId, body, cart) => {
  const serverdate = moment().format('YYYY-MM-DD');
  let Buy = await streamingOrder.find({ date: serverdate }).count();
  let centerdata = '';
  if (Buy < 9) {
    centerdata = '0000';
  }
  if (Buy < 99 && Buy >= 9) {
    centerdata = '000';
  }
  if (Buy < 999 && Buy >= 99) {
    centerdata = '00';
  }
  if (Buy < 9999 && Buy >= 999) {
    centerdata = '0';
  }
  let BillId = '';
  let totalcounts = Buy + 1;
  BillId = 'OD' + centerdata + totalcounts;
  let value = await streamingOrder.create({
    ...{
      orderId: BillId,
    }, ...body.OdrerDetails
  })
  await Dates.create_date(value)
  return value;

}

const addstreaming_order_product = async (shopId, event, order) => {

  let value = await streamingorderProduct.create({
    orderId: order._id,
    postId: event._id,
    productId: event.productId,
    purchase_quantity: event.cartQTY,
    shopId: shopId,
    purchase_price: event.offerPrice
  })
  await Dates.create_date(value)
  return value;

}

const add_odrerPayment = async (shopId, body, orders, payment) => {

  let orderDetails = body.OdrerDetails
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  let value = await streamingorderPayments.create({
    shopId: shopId,
    paidAmt: orderDetails.Amount,
    date: currentDate,
    time: currenttime,
    created: moment(),
    orderId: orders._id,
    type: 'customer',
    paymentMethod: "Gateway",
    reorder_status: false,
    onlinepaymentId: payment.id,
    onlineorderId: payment.order_id,
    paymentTypes: "Online",
    paymentGatway: "razorpay"
  });
  await Dates.create_date(value)
  return value;
}


module.exports = {
  addTocart,
  get_addTocart,
  confirmOrder_razerpay
};
