const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes, verifyOTP } = require('../config/tokens');
const b2busers = require('../models/B2Busers.model');
/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, userRole, expires, type, secret = config.jwt.secret) => {
  const payload = {
    _id: userId,
    userRole: userRole,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, userRole, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    userRole: userRole,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token) => {
  const payload = jwt.verify(token, config.jwt.secret);
  //console.log(payload);
  // const tokenDoc = await Token.findOne({ token, type , user: payload._id, blacklisted: false });
  // //console.log(payload._id)
  // if (!tokenDoc) {
  //   return "hello"
  // }
  const userss = await b2busers.findOne({ _id: payload._id });
  //console.log(userss);
  if (!userss) {
    return false;
  }
  return true;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(user.id, user.userRole, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, user.userRole, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, user.userRole, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
const generateAuthTokens_forget = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(user._id, user.userRole, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user._id, user.userRole, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user._id, user.userRole, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  //console.log(verifyEmailToken);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

const generateAuthTokens_shop = async (shop) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(shop._id, shop, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(shop._id, shop, refreshTokenExpires, tokenTypes.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateAuthTokens_supplier = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(shop._id, shop, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(shop._id, shop, refreshTokenExpires, tokenTypes.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
const generateAuthTokens_verifedOTP = async (user) => {
  const accessTokenExpires = moment().add(30, 'minutes');
  const accessToken = generateToken(user._id, user, accessTokenExpires, verifyOTP.ACCESS);
  const refreshTokenExpires = moment().add(30, 'minutes');
  const refreshToken = generateToken(user._id, user, refreshTokenExpires, verifyOTP.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
const generateAuthTokens_sellerApp = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'days');
  const accessToken = generateToken(user._id, user, accessTokenExpires, verifyOTP.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user._id, user, refreshTokenExpires, verifyOTP.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateAuthTokens_forget,
  generateAuthTokens_shop,
  generateAuthTokens_verifedOTP,
  generateAuthTokens_sellerApp
};
