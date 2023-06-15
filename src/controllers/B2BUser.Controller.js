const httpStatus = require('http-status');
const pick = require('../utils/pick');
const { tokenTypes } = require('../config/tokens');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const b2bUsersService = require('../services/B2BUsers.service');
const tokenService = require('../services/token.service');
const ManageSalary = require('../services/manage.salary.service');

const createB2bUsers = catchAsync(async (req, res) => {
  const users = await b2bUsersService.createUser(req.body);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'users Not Fount');
  }
  await ManageSalary.createManageSalary({
    userid: users.id,
    salary: req.body.salary,
  });
  res.status(httpStatus.CREATED).send(users);
});

const B2bUsersLogin = catchAsync(async (req, res) => {
  const users = await b2bUsersService.UsersLogin(req.body);
  const tokens = await tokenService.generateAuthTokens(users);
  res.send({ users, tokens });
});

const PurchaseExecutivelogin = catchAsync(async (req, res) => {
  const users = await b2bUsersService.PurchaseExecutivelogin(req.body);
  const tokens = await tokenService.generateAuthTokens(users);
  res.send({ users, tokens });
});

const getsalesExecuteRolesUsers = catchAsync(async (req, res) => {
  const users = await b2bUsersService.getsalesExecuteRolesUsers();
  res.send(users);
});

const getUsersById = catchAsync(async (req, res) => {
  const users = await b2bUsersService.getUsersById(req.params.id);
  res.send(users);
});

const B2bUsersAdminLogin = catchAsync(async (req, res) => {
  const users = await b2bUsersService.B2bUsersAdminLogin(req.body);
  const tokens = await tokenService.generateAuthTokens(users);
  // let options = {
  //   httpOnly: true,
  // };
  // res.cookie('tokens', tokens.access.token, options).send({ users, tokens });
  res.send({ users, tokens });
});

const B2bUsersLogout = catchAsync(async (req, res) => {
  res.clearCookie('tokens');
  res.clearCookie('login');
  res.send();
});

const smsGateway = catchAsync(async (req, res) => {});

const getAllUsers = catchAsync(async (req, res) => {
  const user = await b2bUsersService.getAllUsers(req.params.page);
  res.send(user);
});

// meta user controller

const createMetaUSers = catchAsync(async (req, res) => {
  const metauser = await b2bUsersService.createMetaUsers(req.body);
  // //console.log(metauser);
  //console.log('working......');
  res.send(metauser);
});

const getAllMetaUser = catchAsync(async (req, res) => {
  const metauser = await b2bUsersService.getAllmetaUsers();
  res.send(metauser);
});

const getusermetaDataById = catchAsync(async (req, res) => {
  const users = await b2bUsersService.getusermetaDataById(req.params.id);
  res.send(users);
});

const updateMetaUsers = catchAsync(async (req, res) => {
  const users = await b2bUsersService.updateMetaUsers(req.params.id, req.body);
  res.send(users);
});

const getForMyAccount = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const users = await b2bUsersService.getForMyAccount(userId);
  res.send(users);
});

const deleteMetaUser = catchAsync(async (req, res) => {
  const users = await b2bUsersService.deleteMetaUser(req.params.id);
  res.send();
});

const changePassword = catchAsync(async (req, res) => {
  let userId = req.userId;
  const users = await b2bUsersService.changePassword(userId, req.body);
  res.send(users);
});

const updatemetadata = catchAsync(async (req, res) => {
  const users = await b2bUsersService.updatemetadata(req.body);
  res.send(users);
});

const forgotPassword = catchAsync(async (req, res) => {
  const users = await b2bUsersService.forgotPassword(req.body);
  res.send(users);
});
const verfiOtp = catchAsync(async (req, res) => {
  const users = await b2bUsersService.otpVerfiy(req.body);
  res.send(users);
});

const updateB2bUsers = catchAsync(async (req, res) => {
  const users = await b2bUsersService.updateB2bUsers(req.params.id, req.body);
  res.send(users);
});

const getUsersDataById = catchAsync(async (req, res) => {
  const users = await b2bUsersService.getUsersDataById(req.params.id);
  res.send(users);
});

const deleteB2bUsersbyId = catchAsync(async (req, res) => {
  const users = await b2bUsersService.deleteB2bUsersbyId(req.params.id);
  res.status(204).send({ message: 'Deleted' });
});

const shopverification = catchAsync(async (req, res) => {
  const users = await b2bUsersService.shopverification(req.userId);
  res.send(users);
});

const getrolebyuser_user = catchAsync(async (req, res) => {
  const users = await b2bUsersService.getrolebyuser_user(req.query.role);
  res.send(users);
});

const gettargetedusers = catchAsync(async (req, res) => {
  const users = await b2bUsersService.gettargetedusers();
  res.send(users);
});

const gettargetedusers_credit = catchAsync(async (req, res) => {
  const users = await b2bUsersService.gettargetedusers_credit();
  res.send(users);
});

const get_stationery_user = catchAsync(async (req, res) => {
  const users = await b2bUsersService.get_stationery_user();
  res.send(users);
});

const get_drivers_all = catchAsync(async (req, res) => {
  const users = await b2bUsersService.get_drivers_all();
  res.send(users);
});

const deliveryExecutive = catchAsync(async (req, res) => {
  const users = await b2bUsersService.deliveryExecutive();
  res.send(users);
});

const sendOTP = catchAsync(async (req, res) => {
  const users = await b2bUsersService.sendOTP(req.body);
  res.send(users);
});

const otpVerfiyPurchaseExecutive = catchAsync(async (req, res) => {
  const users = await b2bUsersService.otpVerfiyPurchaseExecutive(req.body);
  res.send(users);
});

const PurchaseExecutive_setPassword = catchAsync(async (req, res) => {
  const users = await b2bUsersService.PurchaseExecutive_setPassword(req.params.id, req.body);
  res.send(users);
});

const supplierEnroll = catchAsync(async (req, res) => {
  //console.log('sadfsdf');
  const users = await b2bUsersService.supplierEnroll();
  res.send(users);
});

const getUserAttendance = catchAsync(async (req, res) => {
  const data = await b2bUsersService.getUserAttendance(req.params.page);
  res.send(data);
});

const getFines_Details = catchAsync(async (req, res) => {
  const data = await b2bUsersService.getFines_Details(req.params.id);
  res.send(data);
});

const chatBotOtp = catchAsync(async (req, res) => {
  const data = await b2bUsersService.chatBotOtp(req.body);
  res.send(data);
});

const chatBotOtpVerify = catchAsync(async (req, res) => {
  const data = await b2bUsersService.chatBotOtpVerify(req.body);
  res.send(data);
});

module.exports = {
  createB2bUsers,
  getsalesExecuteRolesUsers,
  changePassword,
  B2bUsersLogout,
  B2bUsersLogin,
  B2bUsersAdminLogin,
  createMetaUSers,
  getAllUsers,
  getusermetaDataById,
  getAllMetaUser,
  updateMetaUsers,
  deleteMetaUser,
  getForMyAccount,
  getUsersById,
  updatemetadata,
  forgotPassword,
  verfiOtp,
  updateB2bUsers,
  getUsersDataById,
  deleteB2bUsersbyId,
  shopverification,
  getrolebyuser_user,
  gettargetedusers,
  gettargetedusers_credit,
  get_stationery_user,
  get_drivers_all,
  deliveryExecutive,
  PurchaseExecutivelogin,
  sendOTP,
  otpVerfiyPurchaseExecutive,
  PurchaseExecutive_setPassword,
  supplierEnroll,
  getUserAttendance,
  getFines_Details,
  chatBotOtp,
  chatBotOtpVerify,
};
