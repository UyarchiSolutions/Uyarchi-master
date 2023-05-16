const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const partnersetpriceService = require('../services/partner.setPrice.service');

const SetPartnerPrice = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.SetPartnerPrice(req.body);
  res.send(data);
});

const AddProductByPartner = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.AddProductByPartner(req.body, userId);
  res.send(data);
});

const FetchProductbyPartner = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.FetchProductbyPartner(req.userId, req.params.id);
  res.send(data);
});

const create_Active_cart = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.create_Active_cart(req.body, userId);
  res.send(data);
});

const getActiveCartBy_partner = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.getActiveCartBy_partner(userId);
  res.send(data);
});

const create_PartnerShopOrder = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.create_PartnerShopOrder(req.body, userId);
  res.send(data);
});

const getOrdersbycart = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getOrdersbycart(req.params.id);
  res.send(data);
});

const getOrderedProducts = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getOrderedProducts(req.params.id, req.query.date);
  res.send(data);
});

const updateAddOnStock = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.updateAddOnStock(req.body);
  res.send(data);
});

const Return_Wastage_inCloseStock = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.Return_Wastage_inCloseStock(req.body);
  res.send(data);
});

const getCart_Ordered_Products = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getCart_Ordered_Products(req.query.date);
  res.send(data);
});

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
  FetchProductbyPartner,
  create_Active_cart,
  getActiveCartBy_partner,
  create_PartnerShopOrder,
  getOrdersbycart,
  getOrderedProducts,
  updateAddOnStock,
  Return_Wastage_inCloseStock,
  getCart_Ordered_Products,
};
