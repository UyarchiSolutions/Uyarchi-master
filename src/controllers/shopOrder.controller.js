const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const { shopOrderService } = require('../services');
const { ShopOrder, ProductorderSchema, ShopOrderClone, ProductorderClone } = require('../models/shopOrder.model');

const createshopOrder = catchAsync(async (req, res) => {
  let userid = req.userId;
  const shopOrder = await shopOrderService.createshopOrder(req.body, userid);
  if (!shopOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shopOrder Not Fount.');
  }
  res.status(httpStatus.CREATED).send(shopOrder);
});

const createshopOrderClone = catchAsync(async (req, res) => {
  let userid = req.userId;
  const shopOrderClone = await shopOrderService.createshopOrderClone(req.body, userid);
  res.send(shopOrderClone);
});

const getAllShopOrderClone = catchAsync(async (req, res) => {
  const shopOrderClone = await shopOrderService.getAllShopOrderClone(req.params.date, req.params.page);
  res.send(shopOrderClone);
});

const getShopOrderCloneById = catchAsync(async (req, res) => {
  const shopOrderClone = await shopOrderService.getShopOrderCloneById(req.params.id);
  if (!shopOrderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  res.send(shopOrderClone[0]);
});

const updateShopOrderCloneById = catchAsync(async (req, res) => {
  const shopOrderClone = await shopOrderService.updateShopOrderCloneById(req.params.id, req.body);
  res.send(shopOrderClone);
});

const deleteShopOrderCloneById = catchAsync(async (req, res) => {
  const shopOrderClone = await shopOrderService.deleteShopOrderCloneById(req.params.id);
  res.send(shopOrderClone);
});

// productOrderClone Controller

const createsPrductOrderClone = catchAsync(async (req, res) => {
  const productOrderClone = await shopOrderService.createProductOrderClone(req.body);
  res.send(productOrderClone);
});

const getAllProductOrderClone = catchAsync(async (req, res) => {
  const productOrderClone = await shopOrderService.getAllProductOrderClone();
  res.send(productOrderClone);
});

// undelivered
const undelivered = catchAsync(async (req, res) => {
  const data = await shopOrderService.undelivered(req.params.page);
  res.send(data);
});

const getProductOrderCloneById = catchAsync(async (req, res) => {
  const productOrderClone = await shopOrderService.getProductOrderCloneById(req.params.id);
  res.send(productOrderClone);
});

const updateProductOrderCloneById = catchAsync(async (req, res) => {
  const productOrderClone = await shopOrderService.updateProductOrderCloneById(req.params.id, req.body);
  res.send(productOrderClone);
});

const deleteProductOrderCloneById = catchAsync(async (req, res) => {
  const productOrderClone = await shopOrderService.deleteProductOrderClone(req.params.id);
  res.send(productOrderClone);
});

const getShopNameWithPagination = catchAsync(async (req, res) => {
  let user = req.userId;
  const shopOrder = await shopOrderService.getShopNameWithPagination(req.params.page, user);
  res.send(shopOrder);
});

const getShopNameCloneWithPagination = catchAsync(async (req, res) => {
  let user = req.userId;
  //console.log(user);
  const shopOrder = await shopOrderService.getShopNameCloneWithPagination(req.params.page, user);
  res.send(shopOrder);
});

const getProductDetailsByProductId = catchAsync(async (req, res) => {
  const shopOrder = await shopOrderService.getProductDetailsByProductId(req.params.id);
  res.send(shopOrder);
});

const getAllShopOrder = catchAsync(async (req, res) => {
  let UserRole = req.userRole;
  //console.log(UserRole);
  const shoporder = await shopOrderService.getAllShopOrder(UserRole);
  res.send(shoporder);
});

const getShopOrderById = catchAsync(async (req, res) => {
  const shoporder = await shopOrderService.getShopOrderById(req.params.shopOrderId);
  if (!shoporder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shoporder Not Found');
  }
  res.send(shoporder);
});

const updateshopOrderById = catchAsync(async (req, res) => {
  const shopOrder = await shopOrderService.updateShopOrderById(req.params.shopOrderId, req.body);
  res.send(shopOrder);
});

const deleteShopOrderById = catchAsync(async (req, res) => {
  await shopOrderService.deleteShopOrderById(req.params.shopOrderId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAll = catchAsync(async (req, res) => {
  const telecaller = await shopOrderService.getAll();
  res.send(telecaller);
});

const createOrderId = catchAsync(async (req, res) => {
  const Buy = await ShopOrderClone.find({ date: currentDate }).count();
  let center = '';
  // //console.log(Buy.length);
  if (Buy < 9) {
    center = '00000';
  }
  if (Buy < 99 && Buy >= 9) {
    center = '0000';
  }
  if (Buy < 999 && Buy >= 99) {
    center = '000';
  }
  if (Buy < 9999 && Buy >= 999) {
    center = '00';
  }
  if (Buy < 99999 && Buy >= 9999) {
    center = '0';
  }
  // //console.log(center, 0);
  let userId = '';
  let totalcount = Buy + 1;

  userId = 'OD' + center + totalcount;

  let supplierss;
  if (userId != '') {
    supplierss = await shopOrderService.createOrderId(req.body);
  }
  //console.log(userId);
  supplierss.OrderId = userId;
  //console.log(supplierss);
  // //console.log(supplierss)
  res.status(httpStatus.CREATED).send(supplierss);
  await supplierss.save();
});

const updateshop_order = catchAsync(async (req, res) => {
  const data = await shopOrderService.updateshop_order(req.params.id, req.body, req.userId);
  res.send(data);
});

const getShopDetailsByOrder = catchAsync(async (req, res) => {
  const shopOrdes = await shopOrderService.getShopDetailsByOrder(req.params.id);
  res.send(shopOrdes);
});

const B2BManageOrders = catchAsync(async (req, res) => {
  const shoporders = await shopOrderService.B2BManageOrders(req.params.shopid);
  res.send(shoporders);
});

const getManageordersByOrderId = catchAsync(async (req, res) => {
  let userId = req.userId;
  const shopOrder = await shopOrderService.getManageordersByOrderId(req.params.orderId, req.params.date);
  res.send(shopOrder);
});

const getproductOrders_By_OrderId = catchAsync(async (req, res) => {
  const shopOrder = await shopOrderService.getproductOrders_By_OrderId(req.params.orderId);
  res.send(shopOrder);
});

const productData = catchAsync(async (req, res) => {
  const data = await shopOrderService.productData(req.params.id);
  res.send(data);
});

const get_data_for_lapster = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_data_for_lapster(req.params.page);
  res.send(data);
});

const getLapsed_Data = catchAsync(async (req, res) => {
  //console.log('hello');
  let userRoles = req.userRole;
  let UserId = req.userId;
  //console.log(req.params);
  if (req.params.status == 'pending') {
    const data = await shopOrderService.getLapsed_Data(req.params.page, userRoles, UserId, 'lp');
    res.send(data);
  }
  if (req.params.status == 'callback') {
    const data = await shopOrderService.lapsed_callBack(req.params.page, userRoles, UserId, 'lp');
    res.send(data);
  }
  if (req.params.status == 'accept') {
    const data = await shopOrderService.lapsed_accept(req.params.page, userRoles, UserId, 'lp');
    res.send(data);
  }
  if (req.params.status == 'declined') {
    const data = await shopOrderService.lapsed_declined(req.params.page, userRoles, UserId, 'lp');
    res.send(data);
  }
  if (req.params.status == 'reschedule') {
    const data = await shopOrderService.lapsed_reschedule(req.params.page, userRoles, UserId, 'lp');
    res.send(data);
  }
});
const getLapsed_Rejected = catchAsync(async (req, res) => {
  let userRoles = req.userRole;
  let UserId = req.userId;
  //console.log(req.params);

  if (req.params.status == 'pending') {
    const data = await shopOrderService.getLapsed_Data(req.params.page, userRoles, UserId, 're');
    res.send(data);
  }
  if (req.params.status == 'callback') {
    const data = await shopOrderService.lapsed_callBack(req.params.page, userRoles, UserId, 're');
    res.send(data);
  }
  if (req.params.status == 'accept') {
    const data = await shopOrderService.lapsed_accept(req.params.page, userRoles, UserId, 're');
    res.send(data);
  }
  if (req.params.status == 'declined') {
    const data = await shopOrderService.lapsed_declined(req.params.page, userRoles, UserId, 're');
    res.send(data);
  }
  if (req.params.status == 'reschedule') {
    const data = await shopOrderService.lapsed_reschedule(req.params.page, userRoles, UserId, 're');
    res.send(data);
  }
});

const getLapsed_Undelivered = catchAsync(async (req, res) => {
  let userRoles = req.userRole;
  let UserId = req.userId;
  //console.log(req.params);

  if (req.params.status == 'pending') {
    const data = await shopOrderService.getLapsed_Data(req.params.page, userRoles, UserId, 'un');
    res.send(data);
  }
  if (req.params.status == 'callback') {
    const data = await shopOrderService.lapsed_callBack(req.params.page, userRoles, UserId, 'un');
    res.send(data);
  }
  if (req.params.status == 'accept') {
    const data = await shopOrderService.lapsed_accept(req.params.page, userRoles, UserId, 'un');
    res.send(data);
  }
  if (req.params.status == 'declined') {
    const data = await shopOrderService.lapsed_declined(req.params.page, userRoles, UserId, 'un');
    res.send(data);
  }
  if (req.params.status == 'reschedule') {
    const data = await shopOrderService.lapsed_reschedule(req.params.page, userRoles, UserId, 'un');
    res.send(data);
  }
});

const getCallhistories = catchAsync(async (req, res) => {
  let userRoles = req.userRole;
  let UserId = req.userId;
  const data = await shopOrderService.getCallhistories(req.params.shopId, userRoles, UserId);
  res.send(data);
});

const getFindbyId = catchAsync(async (req, res) => {
  const data = await shopOrderService.getFindbyId(req.params.id);
  res.send(data);
});

const lapsedordercount = catchAsync(async (req, res) => {
  const data = await shopOrderService.lapsedordercount('lp');
  res.send(data);
});
const lapsedordercountReject = catchAsync(async (req, res) => {
  const data = await shopOrderService.lapsedordercount('re');
  res.send(data);
});
const lapsedordercountUndelivered = catchAsync(async (req, res) => {
  const data = await shopOrderService.lapsedordercount('un');
  res.send(data);
});

const getBills_ByShop = catchAsync(async (req, res) => {
  const data = await shopOrderService.getBills_ByShop(req.params.shopId);
  res.send(data);
});

const getBills_DetailsByshop = catchAsync(async (req, res) => {
  const data = await shopOrderService.getBills_DetailsByshop(req.params.shopId, req.params.page);
  res.send(data);
});
const vieworderbill_byshop = catchAsync(async (req, res) => {
  const data = await shopOrderService.vieworderbill_byshop(req.params.shopId);
  res.send(data);
});

const mismachstockscreate = catchAsync(async (req, res) => {
  const data = await shopOrderService.mismachstockscreate(req.body);
  res.send(data);
});

const WA_Order_status = catchAsync(async (req, res) => {
  const data = await shopOrderService.WA_Order_status(req.params.page);
  res.send(data);
});

const OGorders_MDorders = catchAsync(async (req, res) => {
  const data = await shopOrderService.OGorders_MDorders(req.params.id);
  res.send(data);
});

const details_Of_Payment_by_Id = catchAsync(async (req, res) => {
  const data = await shopOrderService.details_Of_Payment_by_Id(req.params.id);
  res.send(data);
});

const getPaymenthistory = catchAsync(async (req, res) => {
  const data = await shopOrderService.getPaymenthistory(req.params.id);
  res.send(data);
});

const getallmanageIssus = catchAsync(async (req, res) => {
  const data = await shopOrderService.getallmanageIssus(req.query);
  res.send(data);
});

const getmanageIssus_byID = catchAsync(async (req, res) => {
  const data = await shopOrderService.getmanageIssus_byID(req.query);
  res.send(data);
});

const UnDeliveredOrders = catchAsync(async (req, res) => {
  const data = await shopOrderService.UnDeliveredOrders(req.query);
  res.send(data);
});

const getall_ordered_shops = catchAsync(async (req, res) => {
  const data = await shopOrderService.getall_ordered_shops(req.query);
  res.send(data);
});

const get_approved_orders = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_approved_orders(req.query);
  res.send(data);
});

const get_rejected_orders = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_rejected_orders(req.query);
  res.send(data);
});

const get_ward_by_orders = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_ward_by_orders(req.query);
  res.send(data);
});

const get_assignorder_timeloss = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_assignorder_timeloss(req.query);
  res.send(data);
});

const get_assignorder_reassgin = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_assignorder_reassgin(req.body);
  res.send(data);
});

const get_assignorder_remove = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_assignorder_remove(req.body);
  res.send(data);
});

const sort_by_order_wde = catchAsync(async (req, res) => {
  const data = await shopOrderService.sort_by_order_wde(req.body);
  res.send(data);
});

const update_issue_status_approved = catchAsync(async (req, res) => {
  const data = await shopOrderService.update_issue_status_approved(req.query);
  res.send(data);
});
const update_issue_status_decline = catchAsync(async (req, res) => {
  const data = await shopOrderService.update_issue_status_decline(req.query);
  res.send(data);
});

const order_process_to_completed = catchAsync(async (req, res) => {
  const data = await shopOrderService.order_process_to_completed(req.query);
  res.send(data);
});

const order_process_to_return = catchAsync(async (req, res) => {
  const data = await shopOrderService.order_process_to_return(req.query);
  res.send(data);
});

const order_issue_return = catchAsync(async (req, res) => {
  const data = await shopOrderService.order_issue_return();
  res.send(data);
});

const shopDataMap = catchAsync(async (req, res) => {
  const data = await shopOrderService.shopDataMap(req.query);
  res.send(data);
});

const issueStatus_Update = catchAsync(async (req, res) => {
  const data = await shopOrderService.issueStatus_Update(req.params.id, req.body);
  res.send(data);
});

const issueStatus_Update_assign = catchAsync(async (req, res) => {
  const data = await shopOrderService.issueStatus_Update_assign(req.params.id, req.body);
  res.send(data);
});

const get_issue_product_list = catchAsync(async (req, res) => {
  const data = await shopOrderService.get_issue_product_list(req);
  res.send(data);
});

const issue_collection_start = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_start(req);
  res.send(data);
});
const issue_collection_reached = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_reached(req);

  res.send(data);
});
const issue_collection_checked = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_checked(req);
  if (req.files) {
    if (req.files.length != 0) {
      let images = [];
      req.files.forEach(function (files, index, arr) {
        images.push('images/issue/' + files.filename);
      });
      data.issue_returnImage = images;
      data.save();
    }
  }
  res.send(data);
});
const issue_collection_checked_video = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_checked_video(req);
  res.send(data);
});
const issue_collection_pickedup = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_pickedup(req);
  res.send(data);
});
const issue_collection_rejected = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_rejected(req);
  res.send(data);
});
const issue_collection_returntosm = catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_returntosm(req);
  res.send(data);
});

const issue_collection_recieved= catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_recieved(req);
  res.send(data);
});
const issue_collection_calculated= catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_calculated(req);
  res.send(data);
});

const issue_collection_reconfirm= catchAsync(async (req, res) => {
  const data = await shopOrderService.issue_collection_reconfirm(req);
  res.send(data);
});


const get_selfpickupOrders= catchAsync(async (req, res) => {
  const data = await shopOrderService.get_selfpickupOrders(req);
  res.send(data);
});

const get_selfpickupOrders_group= catchAsync(async (req, res) => {
  const data = await shopOrderService.get_selfpickupOrders_group(req);
  res.send(data);
});

module.exports = {
  vieworderbill_byshop,
  createshopOrder,
  getAllShopOrder,
  getShopOrderById,
  getShopNameWithPagination,
  updateshopOrderById,
  getProductDetailsByProductId,
  deleteShopOrderById,

  // shopOrderClone Controllers
  createshopOrderClone,
  getAllShopOrderClone,
  getShopOrderCloneById,
  updateShopOrderCloneById,
  deleteShopOrderCloneById,

  // productOrderClone
  getShopNameCloneWithPagination,
  createsPrductOrderClone,
  getAllProductOrderClone,
  getProductOrderCloneById,
  updateProductOrderCloneById,
  deleteProductOrderCloneById,

  // Telecaller
  getAll,
  updateshop_order,
  createOrderId,
  getShopDetailsByOrder,
  undelivered,
  B2BManageOrders,
  getproductOrders_By_OrderId,
  getManageordersByOrderId,
  productData,
  get_data_for_lapster,
  getLapsed_Data,
  getLapsed_Rejected,
  getLapsed_Undelivered,
  getCallhistories,
  getFindbyId,
  lapsedordercount,
  lapsedordercountReject,
  lapsedordercountUndelivered,
  getBills_ByShop,
  getBills_DetailsByshop,
  mismachstockscreate,
  WA_Order_status,
  OGorders_MDorders,
  details_Of_Payment_by_Id,
  getPaymenthistory,
  getallmanageIssus,
  getmanageIssus_byID,
  UnDeliveredOrders,
  getall_ordered_shops,
  get_approved_orders,
  get_ward_by_orders,
  get_assignorder_timeloss,
  get_rejected_orders,
  get_assignorder_reassgin,
  get_assignorder_remove,
  sort_by_order_wde,
  update_issue_status_approved,
  update_issue_status_decline,
  order_process_to_completed,
  order_process_to_return,
  order_issue_return,
  shopDataMap,
  issueStatus_Update,
  issueStatus_Update_assign,
  get_issue_product_list,


  issue_collection_start,
  issue_collection_reached,
  issue_collection_checked,
  issue_collection_checked_video,
  issue_collection_pickedup,
  issue_collection_rejected,
  issue_collection_returntosm,
  issue_collection_recieved,
  issue_collection_calculated,
  issue_collection_reconfirm,

  get_selfpickupOrders,
  get_selfpickupOrders_group
};
