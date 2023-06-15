const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service');
const config = require('../config/config');
const Suppliers = require('../models/supplier.model');

const authorization = async (req, res, next) => {
  const tokens = req.headers.auth;
  // //console.log(tokens, 'TOKEN');
  //   //console.log(req.headers.auth);
  // //console.log(req.headers['auth']);
  if (!tokens) {
    return res.send(httpStatus.UNAUTHORIZED, 'user must be LoggedIn....');
  }
  try {
    const payload = jwt.verify(tokens, config.jwt.secret);
    // //console.log(payload, 'asld;fsdafklh');
    const userss = await Suppliers.findOne({ _id: payload._id, active: true });
    // //console.log(userss);
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Not Available');
    }
    req.userId = payload._id;
    // req.userRole = payload.userRole;

    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
  }
};

module.exports = authorization;
