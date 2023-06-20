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

const confirmOrder_razerpay = catchAsync(async (req, res) => {
  const category = await checkout.confirmOrder_razerpay(req.shopId, req.body, req);
  console.log(category)
  setTimeout(async () => {
    await checkout.emit_cart_qty(req, req.body.OdrerDetails.streamId);
  },3000)
  res.send(category);
});

const confirmOrder_cod = catchAsync(async (req, res) => {
  const category = await checkout.confirmOrder_cod(req.shopId, req.body, req);
  setTimeout(async () => {
  await checkout.emit_cart_qty(req, req.body.OdrerDetails.streamId);
  },3000)
  res.send(category);
});

const get_streamingorderproducts = catchAsync(async (req, res) => {
  const data = await checkout.get_streamingorderproducts(req.query);
  res.send(data);
});

const Buyer_Status_Update = catchAsync(async (req, res) => {
  const data = await checkout.Buyer_Status_Update(req.params.id, req.body);
  res.send(data);
});


const proceed_to_pay_start = catchAsync(async (req, res) => {
  const data = await checkout.proceed_to_pay_start(req);
  res.send(data);
});

const proceed_to_pay_stop = catchAsync(async (req, res) => {
  const data = await checkout.proceed_to_pay_stop(req);
  res.send(data);
});

module.exports = {
  addTocart,
  get_addTocart,
  confirmOrder_razerpay,
  confirmOrder_cod,
  get_streamingorderproducts,
  Buyer_Status_Update,
  proceed_to_pay_start,
  proceed_to_pay_stop
};
