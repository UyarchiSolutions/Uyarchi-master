const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { customerService, tokenService } = require('../services');

const create = catchAsync(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  res.status(httpStatus.CREATED).send(customer);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const customer = await customerService.loginCustomerWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(customer);
  res.send({ customer, tokens });
});

// const getcustomer = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'code']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   filter.active = true;
//   const result = await oemService.queryOems(filter, options);
//   res.send(result);
// });

const getcustomer = catchAsync(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.customerId);
  if (!customer || customer.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  res.send(customer);
});

const listOems = catchAsync(async (req, res) => {
  const results = await oemService.listOems();
  res.send(results);
});

const updateOem = catchAsync(async (req, res) => {
  const oem = await oemService.updateOemById(req.params.oemId, req.body);
  res.send(oem);
});

const resetPassword = catchAsync(async (req, res) => {
  await oemService.resetPassword(req.params.oemId, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  await oemService.changePassword(req.params.oemId, req.body.oldPassword, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create,
  login,
  getcustomer,
  updateOem,
  resetPassword,
  changePassword,
  listOems,
};
