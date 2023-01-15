const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { customerAuthService, customerService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  const tokens = await tokenService.generateAuthTokens(customer);
  res.status(httpStatus.CREATED).send({ customer, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const customer = await customerAuthService.logincustomerWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(customer);
  res.send({ customer, tokens });
});

const logout = catchAsync(async (req, res) => {
  await customerAuthService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await customerAuthService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await customerAuthService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.customer);
  await emailService.sendVerificationEmail(req.customer.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await customerAuthService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
