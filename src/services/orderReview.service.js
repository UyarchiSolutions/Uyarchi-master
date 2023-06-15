const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const OrderReview = require('../models/orderReview.model');
const moment = require('moment');

const createOrderReview = async (shopId, body) => {
  let values = { ...body, ...{ created: moment(), date: moment().format('YYYY-MM-DD'), shopId: shopId } };
  const createReview = await OrderReview.create(values);
  return createReview;
};

const getAllReview = async () => {
  let getreview = await OrderReview.find();
  return getreview;
};

const getallReviews = async (query) => {
  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page
  let getreview = await OrderReview.aggregate([
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shoporderclones',
      },
    },
    {
      $unwind: '$shoporderclones',
    },
    {
      $project: {
        _id: 1,
        shoporderstatus: "$shoporderclones.status",
        orderType: "$shoporderclones.orderType",
        statusActionArray: "$shoporderclones.statusActionArray",
        delivery_type: "$shoporderclones.delivery_type",
        time_of_delivery: "$shoporderclones.time_of_delivery",
        devevery_mode: "$shoporderclones.devevery_mode",
        delivered_date: "$shoporderclones.delivered_date",
        OrderId: "$shoporderclones.OrderId",
        SName: "$b2bshopclones.SName",
        SOwner: "$b2bshopclones.SOwner",
        mobile: "$b2bshopclones.mobile",
        rating: 1,
        comment: 1,
        created: 1,
        date: 1,
        shopId: 1,
        orderId: 1,
        status: 1,
        show:1,
        reply:1,
        replyDate:1
      }
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ])

  let total = await OrderReview.aggregate([
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shoporderclones',
      },
    },
    {
      $unwind: '$shoporderclones',
    },
  ])
  return { value: getreview, total: total.length };
};

const reply_review = async (query, body) => {
  let id = query.id;
  let review = await OrderReview.findByIdAndUpdate({ _id: id }, { reply: body.reply, replyDate: moment(), status: "Replied" }, { new: true })
  return review;
}

const review_toggle = async (query) => {
  let id = query.id;
  let review = await OrderReview.findById(id)
  //console.log(!review.show)
  review =await OrderReview.findByIdAndUpdate({ _id: id }, { show: !review.show }, { new: true })
  return review;
}
module.exports = {
  createOrderReview,
  getAllReview,
  getallReviews,
  reply_review,
  review_toggle
};
