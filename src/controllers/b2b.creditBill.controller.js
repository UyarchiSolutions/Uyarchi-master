const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const creditBillService = require('../services/b2b.creditBill.service');

const getShopWithBill = catchAsync(async (req, res) => {
  const bill = await creditBillService.getShopWithBill(req.params.page);
  res.send(bill);
});

const getWardExecutiveName = catchAsync(async (req, res) => {
  const bill = await creditBillService.getWardExecutiveName();
  res.send(bill);
});

const getsalesmanName = catchAsync(async (req, res) => {
  const bill = await creditBillService.getsalesmanName();
  res.send(bill);
});

const getShopHistory = catchAsync(async (req, res) => {
  const bill = await creditBillService.getShopHistory(req.userId, req.params.id);
  res.send(bill);
});

const createGroupcredit = catchAsync(async (req, res) => {
  const shopOrderClone = await creditBillService.createGroup(req.body);
  res.send(shopOrderClone);
});

const payingCAshWithDEorSM = catchAsync(async (req, res) => {
  const bill = await creditBillService.payingCAshWithDEorSM(req.params.id, req.body);
  res.send(bill);
});

const getManageCreditBillAssigning = catchAsync(async (req, res) => {
  const name = await creditBillService.getManageCreditBillAssigning();
  res.send(name);
});

const getcreditBillDetailsByPassExecID = catchAsync(async (req, res) => {
  const data = await creditBillService.getcreditBillDetailsByPassExecID(req.params.id);
  res.send(data);
});

const updateAssigned = catchAsync(async (req, res) => {
  const approval = await creditBillService.updateAssignedStatusByMultiSelect(req.body);
  res.send(approval);
});

const getHistoryByPassOrderId = catchAsync(async (req, res) => {
  const approval = await creditBillService.getHistoryByPassOrderId(req.params.id);
  res.send(approval);
});

const getDElExecutiveName = catchAsync(async (req, res) => {
  const delName = await creditBillService.getDElExecutiveName();
  res.send(delName);
});
const getsalesName = catchAsync(async (req, res) => {
  const delName = await creditBillService.getsalesName();
  res.send(delName);
});
const getNotAssignData = catchAsync(async (req, res) => {
  const delName = await creditBillService.getNotAssignData(req.params.page);
  res.send(delName);
});

const getShopPendingByPassingShopId = catchAsync(async (req, res) => {
  const delName = await creditBillService.getShopPendingByPassingShopId(req.params.id);
  res.send(delName);
});

const getDeliDetails = catchAsync(async (req, res) => {
  const name = await creditBillService.getDeliDetails();
  res.send(name);
});

const getFineAccount = catchAsync(async (req, res) => {
  const name = await creditBillService.getFineAccount(req.params.id);
  res.send(name);
});

const getDeliveryExecutiveName = catchAsync(async (req, res) => {
  const name = await creditBillService.getDeliveryExecutiveName();
  res.send(name);
});
const getgetGroupAndBill = catchAsync(async (req, res) => {
  const name = await creditBillService.getDetailsByPassGroupId(req.params.id);
  res.send(name);
});

const getgroupbilldetails = catchAsync(async (req, res) => {
  const name = await creditBillService.getgroupbilldetails(req.params.id);
  res.send(name);
});

const GroupDetails = catchAsync(async (req, res) => {
  const name = await creditBillService.getGroupAndBill(req.params.id);
  res.send(name);
});

const submitDispute = catchAsync(async (req, res) => {
  const dispute = await creditBillService.submitDispute(req.params.id, req.body);
  //console.log(req.params.id, req.body);
  res.send(dispute);
});

const getPaymentTypeCount = catchAsync(async (req, res) => {
  const getDta = await creditBillService.getPaymentTypeCount(req.params.id);
  res.send(getDta);
});

const getdeliveryExcutive = catchAsync(async (req, res) => {
  const getDta = await creditBillService.getdeliveryExcutive(req.userId, req.params.page);
  res.send(getDta);
});

const submitfinish = catchAsync(async (req, res) => {
  const dispute = await creditBillService.submitfinish(req.userId, req.params.id);
  //console.log(req.params.id, req.body);
  res.send(dispute);
});

const getCreditBillMaster = catchAsync(async (req, res) => {
  const creditBillMaster = await creditBillService.getCreditBillMaster(req.query);
  res.send(creditBillMaster);
});

const groupCreditBill = catchAsync(async (req, res) => {
  const getGroupDetails = await creditBillService.groupCreditBill(
    req.params.AssignedUserId,
    req.params.date,
    req.params.page
  );
  res.send(getGroupDetails);
});

const getbilldetails = catchAsync(async (req, res) => {
  const getGroupDetails = await creditBillService.getbilldetails(req.query);
  res.send(getGroupDetails);
});

const getPaymenthistory = catchAsync(async (req, res) => {
  const PaymentHistory = await creditBillService.getPaymenthistory(req.params.id);
  res.send(PaymentHistory);
});

const afterCompletion_Of_Delivered = catchAsync(async (req, res) => {
  const data = await creditBillService.afterCompletion_Of_Delivered(
    req.params.shop,
    req.params.date,
    req.params.userId,
    req.params.page
  );
  res.send(data);
});

const last_Paid_amt = catchAsync(async (req, res) => {
  const data = await creditBillService.last_Paid_amt(req.params.id);
  res.send(data);
});

const getPaidHistory_ByOrder = catchAsync(async (req, res) => {
  const data = await creditBillService.getPaidHistory_ByOrder(req.params.id);
  res.send(data);
});

const Approved_Mismatch_amount = catchAsync(async (req, res) => {
  const data = await creditBillService.Approved_Mismatch_amount(req.params.page);
  res.send(data);
});

const getDisputegroupeOnly = catchAsync(async (req, res) => {
  const data = await creditBillService.getDisputegroupeOnly(req.params.de, req.params.date, req.params.page);
  res.send(data);
});

const updateFineStatus = catchAsync(async (req, res) => {
  const data = await creditBillService.updateFineStatus(req.params.id, req.body);
  res.send(data);
});

const getOrdersBills = catchAsync(async (req, res) => {
  const data = await creditBillService.getOrdersBills(req.params.id, req.params.page);
  res.send(data);
});

const fineAnd_Execuse = catchAsync(async (req, res) => {
  const data = await creditBillService.fineAnd_Execuse(req.body);
  res.send(data);
});

module.exports = {
  getShopWithBill,
  getWardExecutiveName,
  getsalesmanName,
  getShopHistory,
  createGroupcredit,
  payingCAshWithDEorSM,
  getManageCreditBillAssigning,
  getcreditBillDetailsByPassExecID,
  updateAssigned,
  getHistoryByPassOrderId,
  getDElExecutiveName,
  getsalesName,
  getNotAssignData,
  getShopPendingByPassingShopId,
  getDeliDetails,
  getFineAccount,
  getDeliveryExecutiveName,
  getgetGroupAndBill,
  GroupDetails,
  submitDispute,
  getPaymentTypeCount,
  getdeliveryExcutive,
  submitfinish,
  getCreditBillMaster,
  groupCreditBill,
  getbilldetails,
  getPaymenthistory,
  afterCompletion_Of_Delivered,
  last_Paid_amt,
  getPaidHistory_ByOrder,
  Approved_Mismatch_amount,
  getgroupbilldetails,
  getDisputegroupeOnly,
  updateFineStatus,
  getOrdersBills,
  fineAnd_Execuse,
};
