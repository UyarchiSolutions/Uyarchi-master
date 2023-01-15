const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const Message = catchAsync(async (req, res) => {
  res.cookie('hello', 'dlskjfhsadjklfhwuqeiofhsdjcfnsdjkahfwuiefhjksdacfnjksadhf');
  res.send({ status: 'Success' });
});

module.exports = { Message };
