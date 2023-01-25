const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service');
const config = require('../config/config');
const SubHost = require('../models/subHost.model');
const authorization = async (req, res, next) => {
  const token = req.headers.auth;
  if (!token) {
    return res.send(httpStatus.UNAUTHORIZED, 'user must be LoggedIn....');
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const userss = await SubHost.findOne({ _id: payload._id, active: true });
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'Shop Not Found');
    }
    req.subhostId = payload._id;
    req.createdBy = userss.createdBy;
    req.phoneNumber = userss.phoneNumber;
    req.shop = userss;

    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
  }
};

module.exports = authorization;
