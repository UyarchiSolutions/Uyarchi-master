const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const subHostService = require('../services/subHost.service');
const tokenService = require('../services/token.service');
const createSubHost = catchAsync(async (req, res) => {
  //console.log(req.userId);
  let userId = req.userId;
  const data = await subHostService.createSubHost(req.body, userId);
  res.send(data);
});

const getActiveSubHosts = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await subHostService.getActiveSubHosts(userId);
  res.send(data);
});

const SendOtp = catchAsync(async (req, res) => {
  const data = await subHostService.SendOtp(req.body);
  res.send(data);
});

const verifyOTP = catchAsync(async (req, res) => {
  const data = await subHostService.verifyOTP(req.body);
  res.send(data);
});

const SetPassword = catchAsync(async (req, res) => {
  const data = await subHostService.SetPassword(req.params.number, req.body);
  res.send(data);
});

const login = catchAsync(async (req, res) => {
  const data = await subHostService.login(req.body);
  const tokens = await tokenService.generateAuthTokens(data);
  res.send({ data: data, token: tokens });
});

const get_subhost_tokens = catchAsync(async (req, res) => {
  const data = await subHostService.get_subhost_tokens(req);
  res.send(data);
});

const get_subhost_free = catchAsync(async (req, res) => {
  const data = await subHostService.get_subhost_free(req);
  res.send(data);
});

module.exports = {
  createSubHost,
  getActiveSubHosts,
  SendOtp,
  verifyOTP,
  SetPassword,
  login,
  get_subhost_tokens,
  get_subhost_free
};
