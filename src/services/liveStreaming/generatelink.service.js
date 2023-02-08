const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');


const generateLink = async (data) => {
  const payload = {
    _id: data._id,
    supplier: data.supplier,
    plan: data.plan,
    iat: moment().unix(),
    exp: data.exp.unix(),
    type: 'access',
  };
  return jwt.sign(payload, 'privatePlan');
};
const verifyLink = async (link) => {
  try {
    const payload = jwt.verify(link, 'privatePlan');
    return payload;
  } catch {
    throw new ApiError(httpStatus.NOT_FOUND, 'Link Expired');
  }
};



module.exports = {
  generateLink,
  verifyLink
};
