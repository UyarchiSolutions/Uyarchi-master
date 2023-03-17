const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const {
  streamingCart,
  streamingOrder,
  streamingorderProduct,
  streamingorderPayments,
} = require('../../models/liveStreaming/checkout.model');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister, streamPlanlink } = require('../../models/ecomplan.model');

const axios = require('axios'); //
const Dates = require('../Date.serive');
const paymentgatway = require('../paymentgatway.service');

const addTocart = async (req) => {
  let shopId = req.shopId;
  let streamId = req.body.streamId;
  let cart = req.body.cart;
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
  console.log(value);
  if (!value) {
    value = await streamingCart.create({ cart: cart, shopId: shopId, streamId: streamId });
    await Dates.create_date(value);
  } else {
    value.cart = cart;
    value.save();
  }
  return value;
};
const get_addTocart = async (req) => {
  let shopId = req.shopId;
  let streamId = req.query.streamId;
  return new Promise(async (resolve) => {
    let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
    if (value) {
      let cartProducts = [];
      for (let i = 0; i < value.cart.length; i++) {
        let post = await StreamPost.findById(value.cart[i].streamPostId);
        if (post) {
          let minimunQTY = post.pendingQTY >= post.minLots;
          let allowedQTY = post.pendingQTY >= value.cart[i].cartQTY;
          let cartview = { ...value.cart[i], ...{ minLots: post.minLots, minimunQTY: minimunQTY, allowedQTY: allowedQTY, orderedQTY: post.orderedQTY, pendingQTY: post.pendingQTY, totalpostQTY: post.quantity } }
          cartProducts.push(cartview)
        }
      }
      value.cart = cartProducts;
      resolve(value);
    }
    else {
      resolve(value);
    }
  });
};

const confirmOrder_cod = async (shopId, body) => {
  let orders;
  let streamId = body.OdrerDetails.cart;
  return new Promise(async (resolve) => {
    let cart = await streamingCart.findById(streamId);
    if (!cart || cart.status == 'ordered') {
      throw new ApiError(httpStatus.NOT_FOUND, 'cart not found 🖕');
    }
    orders = await addstreaming_order(shopId, body, cart);
    let paymantss = await add_odrerPayment_cod(shopId, body, orders);
    cart.cart.forEach(async (e) => {
      await addstreaming_order_product(shopId, e, orders);
    });
    cart.status = 'ordered';
    cart.save();
    resolve(orders);
  });
};
const confirmOrder_razerpay = async (shopId, body) => {
  let orders;
  let streamId = body.OdrerDetails.cart;
  console.log(body);
  console.log(streamId);
  if (body.PaymentDatails != null) {
    let payment = await paymentgatway.verifyRazorpay_Amount(body.PaymentDatails);
    let collectedAmount = payment.amount / 100;
    let collectedstatus = payment.status;
    if (collectedstatus == 'captured' && collectedAmount == body.OdrerDetails.Amount) {
      let cart = await streamingCart.findById(streamId);
      if (!cart || cart.status == 'ordered') {
        throw new ApiError(httpStatus.NOT_FOUND, 'cart not found 🖕');
      }
      let orders = await addstreaming_order(shopId, body, cart, collectedAmount);
      let paymantss = await add_odrerPayment(shopId, body, orders, payment);
      cart.cart.forEach(async (e) => {
        await addstreaming_order_product(shopId, e, orders);
      });
      cart.status = 'ordered';
      cart.save();
      return orders;
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
      shopId: shopId,
    },
    ...body.OdrerDetails,
  });
  await Dates.create_date(value);
  return value;
};

const addstreaming_order_product = async (shopId, event, order) => {
  let value = await streamingorderProduct.create({
    orderId: order._id,
    postId: event._id,
    productId: event.productId,
    purchase_quantity: event.cartQTY,
    shopId: shopId,
    purchase_price: event.offerPrice,
    streamId: order.streamId,
    streamPostId: event.streamPostId
  });
  let post = await StreamPost.findById(event.streamPostId);
  if (post) {
    let total = 0;
    if (post.orderedQTY) {
      total = post.orderedQTY + event.cartQTY;
    }
    else {
      total = event.cartQTY;
    }
    post.orderedQTY = total;
    post.pendingQTY = post.quantity - total;
    post.save();
  }

  await Dates.create_date(value);
  return value;
};

const add_odrerPayment = async (shopId, body, orders, payment) => {
  let orderDetails = body.OdrerDetails;
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
    paymentMethod: 'Gateway',
    reorder_status: false,
    onlinepaymentId: payment.id,
    onlineorderId: payment.order_id,
    paymentTypes: 'Online',
    paymentGatway: 'razorpay',
    streamId: orderDetails.streamId,
    bookingtype: orderDetails.bookingtype,
    totalAmount: orderDetails.totalAmount,
  });
  await Dates.create_date(value);
  return value;
};
const add_odrerPayment_cod = async (shopId, body, orders) => {
  let orderDetails = body.OdrerDetails;
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  let value = await streamingorderPayments.create({
    shopId: shopId,
    paidAmt: 0,
    date: currentDate,
    time: currenttime,
    created: moment(),
    orderId: orders._id,
    type: 'customer',
    paymentMethod: 'COD',
    reorder_status: false,
    paymentTypes: 'cod',
    streamId: orderDetails.streamId,
  });
  await Dates.create_date(value);
  return value;
};

// fetch streamingorderproducts
const get_streamingorderproducts = async (query) => {
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: query.postId,
        productId: query.productId,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'Buyers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Buyers',
      },
    },
    {
      $lookup: {
        from: 'streamingorders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'streamingOrders',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamingOrders',
      },
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: 'postId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              as: 'streamRequest',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$streamRequest',
            },
          },
        ],
        as: 'stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stream',
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        postId: 1,
        purchase_quantity: 1,
        purchase_price: 1,
        BuyerName: '$Buyers.SName',
        status: 1,
        checkOut: '$streamingOrders.created',
        streamingDate_time: '$stream.streamRequest.streamingDate_time',
      },
    },
  ]);
  return values;
};

// Confirm or Denied

const Buyer_Status_Update = async (id, body) => {
  let values = await streamingorderProduct.findById(id);
  let { status } = body;
  status = status.toLowerCase();
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Streaming Order Not Found 🖕');
  }
  values = await streamingorderProduct.findByIdAndUpdate({ _id: id }, { status: status }, { new: true });
  return values;
};

module.exports = {
  addTocart,
  get_addTocart,
  confirmOrder_razerpay,
  confirmOrder_cod,
  get_streamingorderproducts,
  Buyer_Status_Update,
};
