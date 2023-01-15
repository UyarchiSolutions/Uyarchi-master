const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const OrderReviewService = require('../services/orderReview.service');

const createOrderReview = catchAsync(async (req, res) => {
  const data = await OrderReviewService.createOrderReview(req.shopId, req.body);
  res.send(data);
});

const getAllReview = catchAsync(async (req, res) => {
  const data = await OrderReviewService.getAllReview();
  res.send(data);
});

const getallReviews = catchAsync(async (req, res) => {
  const data = await OrderReviewService.getallReviews(req.query);
  res.send(data);
});

const reply_review = catchAsync(async (req, res) => {
  const data = await OrderReviewService.reply_review(req.query,req.body);
  res.send(data);
});

const review_toggle = catchAsync(async (req, res) => {
  const data = await OrderReviewService.review_toggle(req.query);
  res.send(data);
});
module.exports = {
  createOrderReview,
  getAllReview,
  getallReviews,
  reply_review,
  review_toggle
};
