const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const checkout = require('../../services/liveStreaming/checkout.service');

const addTocart = catchAsync(async (req, res) => {
  const tokens = await checkout.addTocart(req);
  res.status(httpStatus.CREATED).send(tokens);
});
const get_addTocart = catchAsync(async (req, res) => {
  const tokens = await checkout.get_addTocart(req);
  res.status(httpStatus.CREATED).send(tokens);
});
module.exports = {
  addTocart,
  get_addTocart
};
