const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const productpackTypeService = require('../services/productPacktype.service');

const createproductpack = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.createproductpackTypeData(req.body);
  const postorderhistory = await productpackTypeService.createHistoryproductpackTypeData(req.body, postorder._id);
  res.status(httpStatus.CREATED).send(postorderhistory);
});

const getproductpackrById = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.getproductpackTypeById(req.params.id);
  res.send(postorder);
});

const getAllproductpackrById = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.getALLproductpackTypeById(req.params.page);
  //   //console.log(req.params.page);
  res.send(postorder);
});
const get_product_withpacktype = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.get_product_withpacktype(req.params.search, req.params.page, req.query);
  //   //console.log(req.params.page);
  res.send(postorder);
});

const getproductpackShowById = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.getproductpackTypeshow(req.params.id);
  res.send(postorder);
});

const updateproductpackById = catchAsync(async (req, res) => {
  const postorder = await productpackTypeService.updateproductpackTypeId(req.params.id, req.body);
  res.send(postorder);
});
const deleteproductpack = catchAsync(async (req, res) => {
  await productpackTypeService.deleteproductPackTypeById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createproductpack,
  getproductpackrById,
  updateproductpackById,
  deleteproductpack,
  getproductpackShowById,
  getAllproductpackrById,
  get_product_withpacktype,
};
