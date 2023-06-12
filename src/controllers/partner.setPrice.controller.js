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
  let userId = req.userId;
  const data = await partnersetpriceService.getCart_Ordered_Products(req.query.date, userId);
  res.send(data);
});

const createPartnerOrder_FromAdmin = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.createPartnerOrder_FromAdmin(req.body, req.userId);
  res.send(data);
});

const getOrdersByPartner = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getOrdersByPartner(req.userId);
  res.send(data);
});

const getOrder_For_CurrentDateByCart = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getOrder_For_CurrentDateByCart(req.query);
  res.send(data);
});

const DistributeGIven = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.DistributeGIven(req.body);
  res.send(data);
});

const getPartner_Orders = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getPartner_Orders();
  res.send(data);
});

const update_Partner_Individual_Orders = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.update_Partner_Individual_Orders(req.body);
  res.send(data);
});

const orderChange_Status = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.orderChange_Status(req.params.id, req.body);
  res.send(data);
});

const getAck_Orders = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getAck_Orders();
  res.send(data);
});

const getPartner_Ordered_Products = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getPartner_Ordered_Products(req.params.id);
  res.send(data);
});

const Add_new_vehicle = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.Add_new_vehicle(req.body);
  res.send(data);
});

const getAll_Vehicles = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getAll_Vehicles();
  res.send(data);
});

const UpdateVehicleById = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.UpdateVehicleById(req.params.id, req.body);
  res.send(data);
});

const update_Partnwe_Order = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.update_Partnwe_Order(req.params.id, req.body);
  res.send(data);
});

const getLoadedOrders = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getLoadedOrders();
  res.send(data);
});

const getFetchdata_For_bills = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getFetchdata_For_bills(req.params.id);
  res.send(data);
});

const Bill_GenerateById = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.Bill_GenerateById(req.body);
  res.send(data);
});

const stockUpdateByCart = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.stockUpdateByCart(req.body);
  res.send(data);
});

const getCartReports = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.getCartReports(req.params.id);
  res.send(data);
});

const getCartOrderByProduct = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.getCartOrderByProduct(req.query, userId);
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
  createPartnerOrder_FromAdmin,
  getOrdersByPartner,
  getOrder_For_CurrentDateByCart,
  DistributeGIven,
  getPartner_Orders,
  update_Partner_Individual_Orders,
  orderChange_Status,
  getAck_Orders,
  getPartner_Ordered_Products,
  Add_new_vehicle,
  getAll_Vehicles,
  UpdateVehicleById,
  update_Partnwe_Order,
  getLoadedOrders,
  getFetchdata_For_bills,
  Bill_GenerateById,
  stockUpdateByCart,
  getCartReports,
  getCartOrderByProduct,
};
