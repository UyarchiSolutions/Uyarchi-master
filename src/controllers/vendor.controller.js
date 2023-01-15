const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { VendorService, tokenService } = require('../services');

const createVenor = catchAsync(async (req, res) => {
  const vendor = await VendorService.createVendor(req.body);
  res.status(httpStatus.CREATED).send(vendor);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const vendor = await VendorService.loginVendorWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(vendor);
  res.send({ vendor, tokens });
});

// const getcustomer = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'code']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   filter.active = true;
//   const result = await oemService.queryOems(filter, options);
//   res.send(result);
// });

const getVendorById = catchAsync(async (req, res) => {
  const vendor = await VendorService.getVendorById(req.params.vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  res.send(vendor);
});

const listVendor = catchAsync(async (req, res) => {
  const results = await VendorService.listVendor();
  res.send(results);
});

const updateVendorById = catchAsync(async (req, res) => {
  const vendor = await VendorService.updateVendorById(req.params.vendorId, req.body);
  res.send(vendor);
});

const resetPassword = catchAsync(async (req, res) => {
  await VendorService.resetPassword(req.params.vendorId, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  await VendorService.changePassword(req.params.vendorId, req.body.oldPassword, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createVenor,
  login,
  getVendorById,
  updateVendorById,
  resetPassword,
  changePassword,
  listVendor,
};
