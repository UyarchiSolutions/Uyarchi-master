const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const postordermodel = require('../models/postorder.model');

const createpostorder = async (body) => {
  const postOrder = await postordermodel.create(body);
  return postOrder;
};

const getallPostOrder = async () => {
  return postordermodel.find();
};

const getPostOrderById = async (id) => {
  const postorder = await postordermodel.findById(id);
  if (!postorder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post Order Not Found');
  }
  return postorder;
};

const updatePostorderById = async (id, updatebody) => {
  let postorder = await postordermodel.findById(id);
  if (!postorder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post Order Not Found');
  }
  postorder = await postordermodel.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  return postorder;
};

module.exports = { createpostorder, getallPostOrder, getPostOrderById, updatePostorderById };
