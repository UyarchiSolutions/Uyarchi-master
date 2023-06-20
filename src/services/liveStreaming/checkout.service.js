const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const {
  streamingCart,
  streamingCartProduct,
  streamingOrder,
  streamingorderProduct,
  streamingorderPayments,
} = require('../../models/liveStreaming/checkout.model');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister, streamPlanlink } = require('../../models/ecomplan.model');

const axios = require('axios'); //
const Dates = require('../Date.serive');
const paymentgatway = require('../paymentgatway.service');

const addTocart = async (req) => {
  // //console.log("asdas",2321312)
  let shopId = req.shopId;
  let streamId = req.body.streamId;
  let cart = req.body.cart;
  // //console.log(cart)
  let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
  // //console.log(value, 12312)
  if (!value) {
    value = await streamingCart.create({ cart: cart, shopId: shopId, streamId: streamId });
    cart.forEach(async (a) => {
      // streamingCart
      let obj = { ...a, ...{ streamingCart: value._id, streamrequestpostId: a._id } };
      delete obj._id
      await streamingCartProduct.create(obj)
    })
    await Dates.create_date(value);
  } else {
    await streamingCartProduct.updateMany({ streamingCart: value._id }, { $set: { cardStatus: false } }, { new: true })
    // value.cart = cart;
    cart.forEach(async (a) => {
      // streamingCart  
      let cartproduct = await streamingCartProduct.findOne({ streamingCart: value._id, streamrequestpostId: a.streamrequestpostId });
      // //console.log(cartproduct)
      if (cartproduct) {
        cartproduct.cartQTY = a.cartQTY;
      }
      else {
        let obj = { ...a, ...{ streamingCart: value._id, streamrequestpostId: a._id } };
        delete obj._id
        cartproduct = await streamingCartProduct.create(obj)
      }
      cartproduct.cardStatus = true;
      cartproduct.add_to_cart = a.add_to_cart;
      cartproduct.save();
    })
    // //console.log(value)
    // //console.log(value)
    value = await streamingCart.findByIdAndUpdate({ _id: value._id }, { cart: cart }, { new: true })
  }

  await emit_cart_qty(req,streamId);
  return value;
};

const emit_cart_qty = async (req,streamId) => {
  let socket_cart = await Streamrequest.aggregate([
    {
      $match: {
        $and: [{ adminApprove: { $eq: 'Approved' } }, { _id: { $eq: streamId } }],
      },
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'streamRequest',
        pipeline: [
          {
            $lookup: {
              from: 'streamposts',
              localField: 'postId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'streamingcartproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'streamingcarts',
                          localField: 'streamingCart',
                          foreignField: '_id',
                          pipeline: [
                            { $match: { $and: [{ status: { $ne: "ordered" } }] } },
                            {
                              $project: {
                                _id: 1
                              }
                            }
                          ],
                          as: 'streamingcarts',
                        }
                      },
                      { $unwind: "$streamingcarts" },
                      { $match: { $and: [{ cardStatus: { $eq: true } }, { add_to_cart: { $eq: true } }] } },
                      { $group: { _id: null, count: { $sum: "$cartQTY" } } },
                    ],
                    as: 'stream_cart',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_cart',
                  },
                },
                {
                  $lookup: {
                    from: 'streamingorderproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [
                      { $group: { _id: null, count: { $sum: "$purchase_quantity" } } },
                    ],
                    as: 'stream_checkout',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_checkout',
                  },
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },

                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
                    productImage: '$products.image',
                    productId: 1,
                    categoryId: 1,
                    quantity: 1,
                    marketPlace: 1,
                    offerPrice: 1,
                    postLiveStreamingPirce: 1,
                    validity: 1,
                    minLots: 1,
                    incrementalLots: 1,
                    suppierId: 1,
                    DateIso: 1,
                    created: 1,
                    streamStart: 1,
                    streamEnd: 1,
                    stream_cart: { $ifNull: ["$stream_cart.count", 0] },
                    stream_checkout: { $ifNull: ["$stream_checkout.count", 0] },

                  },

                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              productImage: '$streamposts.productImage',
              streamStart: '$streamposts.streamStart',
              streamEnd: '$streamposts.streamEnd',
              streampostsId: '$streamposts._id',
              stream_cart: "$streamposts.stream_cart",
              stream_checkout: "$streamposts.stream_checkout",
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $project: {
        _id: 1,
        streamrequestposts: '$streamrequestposts',
      },
    },
  ]);
  req.io.emit(streamId + "cart_qty", socket_cart[0].streamrequestposts);

  return socket_cart[0].streamrequestposts;
}
const get_addTocart = async (req) => {
  let timeNow = new Date().getTime();
  let shopId = req.shopId;
  let streamId = req.query.streamId;
  let value = await streamingCart.aggregate([
    {
      $match: {
        $and: [{ shopId: { $eq: shopId } }, { streamId: { $eq: streamId } }, { status: { $ne: 'ordered' } }]
      }
    },
    {
      $lookup: {
        from: 'streamingcartproducts',
        localField: '_id',
        foreignField: 'streamingCart',
        pipeline: [
          { $match: { $and: [{ cardStatus: { $eq: true } }] } },
          {
            $lookup: {
              from: 'streamposts',
              localField: 'streamPostId',
              foreignField: '_id',
              as: 'streamposts',
            },
          },
          { $unwind: "$streamposts" },
          {
            $lookup: {
              from: 'streamingcartproducts',
              localField: 'streamPostId',
              foreignField: 'streamPostId',
              pipeline: [
                {
                  $lookup: {
                    from: 'streamingcarts',
                    localField: 'streamingCart',
                    foreignField: '_id',
                    pipeline: [
                      { $match: { $and: [{ shopId: { $ne: shopId } }] } }
                    ],
                    as: 'streamingcarts',
                  },
                },
                { $unwind: "$streamingcarts" },
                { $match: { $and: [{ proceed_To_Pay: { $eq: "start" } }, { endTime: { $gte: timeNow } }] } },
                {
                  $group: {
                    _id: null,
                    tempQTY: { $sum: "$cartQTY" }
                  }
                }
              ],
              as: 'streamingcartproducts',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$streamingcartproducts',
            },
          },
          {
            $addFields: {
              minLots: "$streamposts.minLots",
              orderedQTY: "$streamposts.orderedQTY",
              pendingQTY: "$streamposts.pendingQTY",
              totalpostQTY: "$streamposts.quantity",
              minimunQTY: {
                $gte: ['$streamposts.pendingQTY', '$streamposts.minLots']
              },
              allowedQTY: {
                $gte: ['$streamposts.pendingQTY', "$cartQTY"]
              },
              streamingcartproducts: "$streamingcartproducts",
              tempQTY: { $ifNull: ['$streamingcartproducts.tempQTY', 0] },
            }
          },
          {
            $addFields: {
              avaibleQTY: { $subtract: ["$pendingQTY", "$tempQTY"] },
            }
          },
          { $unset: "streamposts" }
        ],
        as: 'cart',
      },
    },

    {
      $project: {
        "status": 1,
        "shopId": 1,
        "streamId": 1,
        "DateIso": 1,
        "created": 1,
        "date": 1,
        cart: "$cart",
        _id: 1,
        endTime: 1,
        proceed_To_Pay: 1,
        startTime: 1
      }
    }

  ]);

  // return new Promise(async (resolve) => {
  //   let value = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
  //   if (value) {
  //     let cartProducts = [];
  //     for (let i = 0; i < value.cart.length; i++) {
  //       let post = await StreamPost.findById(value.cart[i].streamPostId);
  //       if (post) {
  //         let minimunQTY = post.pendingQTY >= post.minLots;
  //         let allowedQTY = post.pendingQTY >= value.cart[i].cartQTY;
  //         let cartview = { ...value.cart[i], ...{ minLots: post.minLots, minimunQTY: minimunQTY, allowedQTY: allowedQTY, orderedQTY: post.orderedQTY, pendingQTY: post.pendingQTY, totalpostQTY: post.quantity } }
  //         cartProducts.push(cartview)
  //       }
  //     }
  //     value.cart = cartProducts;
  //     resolve(value);
  //   }
  //   else {
  //     resolve(value);
  //   }
  // });
  if (value.length == 0) {
    return null;
  }
  return value[0];
};

const confirmOrder_cod = async (shopId, body,req) => {
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
    // await emit_cart_qty(req,body.OdrerDetails.streamId);
    resolve(orders);
  });
};
const confirmOrder_razerpay = async (shopId, body,req) => {
  // let orders;
  let streamId = body.OdrerDetails.cart;
  //console.log(body);
  //console.log(streamId);
  if (body.PaymentDatails != null) {
    let payment = await paymentgatway.verifyRazorpay_Amount(body.PaymentDatails);
    let collectedAmount = payment.amount / 100;
    let collectedstatus = payment.status;
    if (collectedstatus == 'captured' && collectedAmount == body.OdrerDetails.Amount) {
      return new Promise(async (resolve) => {
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
        // return orders;
        resolve(orders);
    });
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


const proceed_to_pay_start = async (req) => {
  let streamId = req.query.id;
  let shopId = req.shopId;
  //console.log(streamId, shopId)
  var startDate = new Date();
  var oldDateObj = new Date();
  var newDateObj = new Date();
  newDateObj.setTime(oldDateObj.getTime() + (3 * 60 * 1000));
  let values = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
  //console.log(values)
  if (values) {
    if (values.proceed_To_Pay == 'start' && values.endTime < startDate.getTime()) {
      //console.log("asda")
      values.endTime = newDateObj.getTime();
      values.startTime = startDate.getTime();
      await streamingCartProduct.updateMany({ streamingCart: values._id }, { $set: { endTime: newDateObj.getTime(), startTime: startDate.getTime(), proceed_To_Pay: "start" } }, { new: true })
    }
    else if (values.proceed_To_Pay != 'start') {
      //console.log("asd2312a")
      values.endTime = newDateObj.getTime();
      values.proceed_To_Pay = "start";
      values.startTime = startDate.getTime();
      await streamingCartProduct.updateMany({ streamingCart: values._id }, { $set: { endTime: newDateObj.getTime(), startTime: startDate.getTime(), proceed_To_Pay: "start" } }, { new: true })
    }
    values.save();
  }
  return values;
};
const proceed_to_pay_stop = async (req) => {
  let streamId = req.query.id;
  let shopId = req.shopId;
  let values = await streamingCart.findOne({ shopId: shopId, streamId: streamId, status: { $ne: 'ordered' } });
  if (values) {
    values.proceed_To_Pay = "stop";
    await streamingCartProduct.updateMany({ streamingCart: values._id }, { $set: { proceed_To_Pay: "stop" } }, { new: true })
    values.save();
  }
  return values;
};

module.exports = {
  addTocart,
  get_addTocart,
  confirmOrder_razerpay,
  confirmOrder_cod,
  get_streamingorderproducts,
  Buyer_Status_Update,
  proceed_to_pay_start,
  proceed_to_pay_stop,
  emit_cart_qty
};
