const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service');
const config = require('../config/config');
const { Seller } = require('../models/seller.models');
const SellerAuth = async (req, res, next) => {
  const token = req.headers.sellerauth
  // //console.log(token)
  if (!token) {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access set');
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const userss = await Seller.findById(payload['_id']);
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'Seller Not Found');
    }
    if (!userss.active) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Disabled');
    }
    req.userId = payload['_id'];
    req.seller = payload.userRole;
    if (userss.mainSeller == 'admin') {
      req.accessBy = userss._id;
    }
    else {
      req.accessBy = userss.mainSeller;
    }
    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access val');
  }
};
const SetPass = async (req, res, next) => {
  const token = req.headers['verifiedaccount'];
  if (!token) {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access set');
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const userss = await Seller.findById(payload['_id']);
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'Seller Not Found');
    }

    req.userId = payload['_id'];
    req.seller = payload.userRole;
    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access val');
  }
};

module.exports = { SellerAuth, SetPass };
