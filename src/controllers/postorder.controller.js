const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const postorderService = require('../services/postorder.service');

const createpostorder = catchAsync(async (req, res) => {
  const postorder = await postorderService.createpostorder(req.body);
  res.send(postorder);
});

const getallPostOrder = catchAsync(async (req, res) => {
  const postorder = await postorderService.getallPostOrder();
  res.send(postorder);
});

const getPostOrderById = catchAsync(async (req, res) => {
  const postorder = await postorderService.getPostOrderById(req.params.id);
  res.send(postorder);
});

const updatePostorderById = catchAsync(async (req, res) => {
  const postorder = await postorderService.updatePostorderById(req.params.id, req.body);
  res.send(postorder);
});

module.exports = { createpostorder, getallPostOrder, getPostOrderById, updatePostorderById };
