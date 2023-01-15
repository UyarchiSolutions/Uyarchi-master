const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ProductComboService } = require('../services');

const createCombo = catchAsync(async (req, res) => {
  const combo = await ProductComboService.createCombo(req.body);
  if (!combo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo Not Fount.');
  }
  res.status(httpStatus.CREATED).send(combo);
});

// const getProducts = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['productTitle', 'unit']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await productService.queryProduct(filter, options);
//   res.send(result);
// });

const getCombo = catchAsync(async (req, res) => {
  const Combo = await ProductComboService.getProductComboById(req.params.comboId);
  if (!Combo || Combo.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found');
  }
  res.send(Combo);
});

const updateCombo = catchAsync(async (req, res) => {
  const combo = await ProductComboService.updateComboById(req.params.comboId, req.body);
  res.send(combo);
});

const deleteCombo = catchAsync(async (req, res) => {
  await ProductComboService.deleteComboById(req.params.comboId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCombo,
  getCombo,
  updateCombo,
  deleteCombo,
};
