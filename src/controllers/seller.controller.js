const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const SellerService = require('../services/seller.service');
const tokenService = require('../services/token.service');

const createSeller = catchAsync(async (req, res) => {
  const data = await SellerService.createSeller(req);
  res.send(data);
});

const verifyOTP = catchAsync(async (req, res) => {
  const data = await SellerService.verifyOTP(req);
  const token = await tokenService.generateAuthTokens_verifedOTP(data)
  res.send(token);
});
const setPassword = catchAsync(async (req, res) => {
  const data = await SellerService.setPassword(req);
  res.send(data);
});

const forgotPass = catchAsync(async (req, res) => {
  const data = await SellerService.forgotPass(req);
  res.send(data);
});

const loginseller = catchAsync(async (req, res) => {
  const data = await SellerService.loginseller(req);
  const tokens = await tokenService.generateAuthTokens_sellerApp(data);
  res.send(tokens);
});

const alreadyUser = catchAsync(async (req, res) => {
  const data = await SellerService.alreadyUser(req);
  res.send(data);
});

const createSubhost = catchAsync(async (req, res) => {
  const data = await SellerService.createSubhost(req);
  res.send(data);
});

const getsubhostAll = catchAsync(async (req, res) => {
  const data = await SellerService.getsubhostAll(req);
  res.send(data);
});

const subhost_free_users = catchAsync(async (req, res) => {
  const data = await SellerService.subhost_free_users(req);
  res.send(data);
});

const disabled_hosts = catchAsync(async (req, res) => {
  const data = await SellerService.disabled_hosts(req);
  res.send(data);
});
const get_single_host = catchAsync(async (req, res) => {
  const data = await SellerService.get_single_host(req);
  res.send(data);
});

const update_single_host = catchAsync(async (req, res) => {
  const data = await SellerService.update_single_host(req);
  res.send(data);
});


const getsubuserAll = catchAsync(async (req, res) => {
  const data = await SellerService.getsubuserAll(req);
  res.send(data);
});

const disabled_subuser = catchAsync(async (req, res) => {
  const data = await SellerService.disabled_subuser(req);
  res.send(data);
});
const get_single_user = catchAsync(async (req, res) => {
  const data = await SellerService.get_single_user(req);
  res.send(data);
});
const update_single_user = catchAsync(async (req, res) => {
  const data = await SellerService.update_single_user(req);
  res.send(data);
});


const createSubUser = catchAsync(async (req, res) => {
  const data = await SellerService.createSubUser(req);
  res.send(data);
});


const mydetails = catchAsync(async (req, res) => {
  const data = await SellerService.mydetails(req);
  res.send(data);
});



const GetAllSeller = catchAsync(async (req, res) => {
  const data = await SellerService.GetAllSeller();
  res.send(data);
});

const GetSellerById = catchAsync(async (req, res) => {
  const data = await SellerService.GetSellerById(req.params.id);
  res.send(data);
});

const UpdateSellerById = catchAsync(async (req, res) => {
  const data = await SellerService.UpdateSellerById(req.params.id, req.body);
  res.send(data);
});
const change_password = catchAsync(async (req, res) => {
  const data = await SellerService.change_password(req);
  res.send(data);
});
const update_my_profile = catchAsync(async (req, res) => {
  const data = await SellerService.update_my_profile(req);
  res.send(data);
});
module.exports = {
  createSeller,
  verifyOTP,
  setPassword,
  forgotPass,
  loginseller,
  GetAllSeller,
  GetSellerById,
  UpdateSellerById,
  alreadyUser,
  createSubhost,
  createSubUser,
  mydetails,
  getsubhostAll,
  getsubuserAll,
  subhost_free_users,
  disabled_hosts,
  disabled_subuser,
  get_single_host,
  update_single_host,
  get_single_user,
  update_single_user,
  change_password,
  update_my_profile
};
