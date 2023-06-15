const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Customer } = require('../models/Scv.mode');

const authorization = async (req, res, next) => {
  const token = req.headers.auth;
  if (!token) {
    return res.send(httpStatus.UNAUTHORIZED, 'user must be LoggedIn....');
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    //console.log(payload);
    const userss = await Customer.findOne({ _id: payload._id });
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Not Available');
    }
    req.userId = payload._id;

    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
  }
};

module.exports = authorization;
