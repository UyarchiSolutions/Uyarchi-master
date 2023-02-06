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
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId })
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
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId })
  return value;
};


const confirmOrder_razerpay = async (shopId, body) => {
  // const
  let orders;
  let streamId = req.body.card;
  if (body.PaymentDatails != null) {
    let payment = await paymentgatway.verifyRazorpay_Amount(body.PaymentDatails);
    let collectedAmount = payment.amount / 100
    let collectedstatus = payment.status;
    if (collectedstatus == 'captured' && collectedAmount == body.OdrerDetails.Amount) {
      let cart = await streamingCart.findById(streamId);
      if (!cart) {
        throw new ApiError(httpStatus.NO_CONTENT, 'cart not found 🖕');
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
  // console.log(cart)
  // console.log();
  // console.log(body)
  // return orders
};

const addstreaming_order = async (shopId, body, cart, collectedAmount) => {
  const serverdate = moment().format('YYYY-MM-DD');
  const servertime = moment().format('HHmmss');
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
      paidAmount: body.OdrerDetails.Amount,
    }, ...body.PaymentDatails, ...body.OdrerDetails
  })

  return value;

}

const addstreaming_order_product = async (shopId, event, order) => {

  let value = await streamingOrder.create({
    orderId: order._id,
    postId: event._id,
    productId: event.productId,
    purchase_quantity: event.cartQTY,
    shopId: shopId,
    purchase_price: event.offerPrice

  })
}

const add_odrerPayment = async (shopId, body, orders, payment) => {

  let orderDetails = body.OdrerDetails
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  return await streamingorderPayments.create({
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
}


module.exports = {
  addTocart,
  get_addTocart,
  confirmOrder_razerpay
};
