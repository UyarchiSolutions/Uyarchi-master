const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const telecallerService = require('../services/telecallerAssign.service');

const createtelecallerAssignReassign = catchAsync(async (req, res) => {
  const data = await telecallerService.createtelecallerAssignReassign(req.body);
  res.send(data);
});

const getAllTelecallerHead = catchAsync(async (req, res) => {
  const data = await telecallerService.getAllTelecallerHead(req.body);
  res.send(data);
});

const getUnassignedtelecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.getUnassignedtelecaller(req.params.page);
  res.send(data);
});

const gettelecallerheadTelecallerdata = catchAsync(async (req, res) => {
  const data = await telecallerService.gettelecallerheadTelecaller(req.params.id);
  res.send(data);
});

const createTelecallerShop = catchAsync(async (req, res) => {
  const data = await telecallerService.createTelecallerShop(req.body);
  res.send(data);
});

const getAllTelecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.getAllTelecaller();
  res.send(data);
});

const getTelecallerAssignedShops = catchAsync(async (req, res) => {
  const data = await telecallerService.getTelecallerAssignedShops(req.params.id);
  res.send(data);
});

const getnotAssignShops = catchAsync(async (req, res) => {
  const data = await telecallerService.getnotAssignShops(
    req.params.zone,
    req.params.id,
    req.params.street,
    req.params.page,
    req.params.limit,
    req.params.uid,
    req.params.date,
    req.params.dastatus,
    req.params.pincode
  );
  res.send(data);
});

const getnotAssignShops_without_Page = catchAsync(async (req, res) => {
  const data = await telecallerService.getnotAssignShops_without_Page(
    req.params.zone,
    req.params.id,
    req.params.street,
    req.params.uid,
    req.params.date,
    req.params.dastatus,
    req.params.pincode
  );
  res.send(data);
});

const getUsersWith_skiped = catchAsync(async (req, res) => {
  const data = await telecallerService.getUsersWith_skiped(req.params.id);
  res.send(data);
});

const Return_Assign_To_telecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.Return_Assign_To_telecaller(req.params.id);
  res.send(data);
});

const createtemperaryAssigndata = catchAsync(async (req, res) => {
  const data = await telecallerService.createtemperaryAssigndata(req.body);
  res.send(data);
});

const getAssignData_by_Telecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.getAssignData_by_Telecaller(req.params.page);
  res.send(data);
});

const assignShopsTelecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopsTelecaller(req.params.id, req.params.page);
  res.send(data);
});

const assignShopsTelecallerdatewise = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopsTelecallerdatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

const assignShopsOnlydatewise = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopsOnlydatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

// salesmanOrder

const createsalesmanAssignReassign = catchAsync(async (req, res) => {
  const data = await telecallerService.createsalesmanAssignReassign(req.body);
  res.send(data);
});

const getAllAsmSalesmanHead = catchAsync(async (req, res) => {
  const data = await telecallerService.getAllAsmSalesmanHead(req.body);
  res.send(data);
});

const getUnassignedsalesmanOrder = catchAsync(async (req, res) => {
  const data = await telecallerService.getUnassignedsalesmanOrder(req.params.page);
  res.send(data);
});

const createsalesmanOrderShop = catchAsync(async (req, res) => {
  const data = await telecallerService.createsalesmanOrderShop(req.body);
  res.send(data);
});

const getsalemanOrderSalesman = catchAsync(async (req, res) => {
  const data = await telecallerService.getsalemanOrderSalesman(req.params.id);
  res.send(data);
});

const getAllSalesman = catchAsync(async (req, res) => {
  const data = await telecallerService.getAllSalesman();
  res.send(data);
});

const getsalesmanOrderAssignedShops = catchAsync(async (req, res) => {
  const data = await telecallerService.getsalesmanOrderAssignedShops(req.params.id);
  res.send(data);
});

const get_my_shops_assigned = catchAsync(async (req, res) => {
  const data = await telecallerService.my_assigned_shops(req.userId, req.query);
  res.send(data);
});

const getnotAssignsalesmanOrderShops = catchAsync(async (req, res) => {
  const data = await telecallerService.getnotAssignsalesmanOrderShops(
    req.params.zone,
    req.params.id,
    req.params.street,
    req.params.page,
    req.params.limit,
    req.params.uid,
    req.params.date,
    req.params.dastatus,
    req.params.pincode,
    req.params.Da
  );
  res.send(data);
});

const getUserssalesmanWith_skiped = catchAsync(async (req, res) => {
  const data = await telecallerService.getUserssalesmanWith_skiped(req.params.id);
  res.send(data);
});

const Return_Assign_To_salesmanOrder = catchAsync(async (req, res) => {
  const data = await telecallerService.Return_Assign_To_salesmanOrder(req.params.id);
  res.send(data);
});

const createsalesmantemperaryAssigndata = catchAsync(async (req, res) => {
  const data = await telecallerService.createsalesmantemperaryAssigndata(req.body);
  res.send(data);
});

const getAssignData_by_SalesmanOrders = catchAsync(async (req, res) => {
  const data = await telecallerService.getAssignData_by_SalesmanOrders(req.params.page);
  res.send(data);
});

const assignShopsSalesmanOrder = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopsSalesmanOrder(req.params.id, req.params.page);
  res.send(data);
});

const assignShopssalesmandatewise = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopssalesmandatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

const assignShopssalesmanOnlydatewise = catchAsync(async (req, res) => {
  const data = await telecallerService.assignShopssalesmanOnlydatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

const history_Assign_Reaasign_datatelecaller = catchAsync(async (req, res) => {
  const data = await telecallerService.history_Assign_Reaasign_datatelecaller(req.params.id);
  res.send(data);
});

const history_Assign_Reaasign_datasalesman = catchAsync(async (req, res) => {
  const data = await telecallerService.history_Assign_Reaasign_datasalesman(req.params.id);
  res.send(data);
});

const pincode = catchAsync(async (req, res) => {
  const data = await telecallerService.pincode(req.query);
  res.send(data);
});

const getnotAssignsalesmanOrderShops_lat = catchAsync(async (req, res) => {
  const data = await telecallerService.getnotAssignsalesmanOrderShops_lat(req.params.zone, req.params.id);
  res.send(data);
});

const AssignedData_By_users = catchAsync(async (req, res) => {
  const data = await telecallerService.AssignedData_By_users(req.params.id);
  res.send(data);
});

const getLat_long = catchAsync(async (req, res) => {
  const data = await telecallerService.getLat_long(req.body);
  res.send(data);
});

const tempAssign = catchAsync(async (req, res) => {
  const data = await telecallerService.tempAssign(req.body);
  res.send(data);
});

const getNewEdite = catchAsync(async (req, res) => {
  const data = await telecallerService.getNewEdite(
    req.params.page,
    req.params.limit,
    req.params.mobile,
    req.params.status,
    req.params.pincode,
    req.params.verify
  );
  res.send(data);
});

const newliEdit = catchAsync(async (req, res) => {
  const data = await telecallerService.newliEdit(req.params.id, req.body);
  res.send(data);
});

module.exports = {
  createtelecallerAssignReassign,
  getAllTelecallerHead,
  getUnassignedtelecaller,
  gettelecallerheadTelecallerdata,
  createTelecallerShop,
  getAllTelecaller,
  getTelecallerAssignedShops,
  getnotAssignShops,
  getUsersWith_skiped,
  Return_Assign_To_telecaller,
  createtemperaryAssigndata,
  getAssignData_by_Telecaller,
  assignShopsTelecaller,
  assignShopsTelecallerdatewise,
  assignShopsOnlydatewise,
  createsalesmanAssignReassign,
  getAllAsmSalesmanHead,
  getUnassignedsalesmanOrder,
  getsalemanOrderSalesman,
  createsalesmanOrderShop,
  getAllSalesman,
  getsalesmanOrderAssignedShops,
  getnotAssignsalesmanOrderShops,
  getUserssalesmanWith_skiped,
  Return_Assign_To_salesmanOrder,
  createsalesmantemperaryAssigndata,
  getAssignData_by_SalesmanOrders,
  assignShopsSalesmanOrder,
  assignShopssalesmandatewise,
  assignShopssalesmanOnlydatewise,
  history_Assign_Reaasign_datatelecaller,
  history_Assign_Reaasign_datasalesman,
  pincode,
  getnotAssignsalesmanOrderShops_lat,
  get_my_shops_assigned,
  getnotAssignShops_without_Page,
  AssignedData_By_users,
  getLat_long,
  tempAssign,
  getNewEdite,
  newliEdit,
};
