const httpStatus = require('http-status');
const b2bBillStatus = require('../models/b2bbillStatus.model');
const ApiError = require('../utils/ApiError');
const CallStatus = require('../models/callStatus');
const moment = require('moment');
let currentDate = moment().format('DD-MM-YYYY');

const createB2bBillStatus = async (body) => {
  let billcount = await b2bBillStatus.find({ date: currentDate }).count();
  //console.log(billcount);
  let center = '';
  if (billcount < 9) {
    center = '000000';
  }
  if (billcount < 99 && billcount >= 9) {
    center = '00000';
  }
  if (billcount < 999 && billcount >= 99) {
    center = '0000';
  }
  if (billcount < 9999 && billcount >= 999) {
    center = '000';
  }
  if (billcount < 99999 && billcount >= 9999) {
    center = '00';
  }
  if (billcount < 999999 && billcount >= 99999) {
    center = '0';
  }
  let total = billcount + 1;
  let billid = center + total;

  const { callStatusId, supplierId, date, mislianeousCost, logisticsCost, others, vehicleNumber } = body;
  let totalExpense = mislianeousCost + logisticsCost + others;
  let round = Math.round(totalExpense);
  let value = { ...body, ...{ BillId: billid, totalExpenseAmount: round, PendingExpenseAmount: round } };
  let callstatus = await CallStatus.find({ vehicleNumber: vehicleNumber, date: date });
  let creations = await b2bBillStatus.create(value);
  callstatus = await CallStatus.updateMany(
    { vehicleNumber: vehicleNumber, date: date },
    { $set: { B2bBillId: creations.id, stockStatus: 'Billed', BillStatus: 'Billed' } },
    { new: true }
  );
  return creations;
};

const getDataForAccountExecutive = async (page) => {
  let values = await b2bBillStatus.aggregate([
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'supplierdata',
      },
    },
    {
      $unwind: '$supplierdata',
    },
    {
      $project: {
        supplierName: '$supplierdata.primaryContactName',
        supplierId: 1,
        _id: 1,
        BillId: 1,
        date: 1,
        callStatusId: 1,
        paymentStatus: 1,
        totalExpenseAmount: 1,
        PendingExpenseAmount: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await b2bBillStatus.find().count();
  return { values: values, total: total };
};

const getBillstatusById = async (id) => {
  let billStatus = await b2bBillStatus.findById(id);
  if (!billStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return billStatus;
};

const ManageDeliveryExpenseBillEntry = async (id, updateBody) => {
  let b2bbillstatus = await b2bBillStatus.findById(id);
  if (!b2bbillstatus || b2bbillstatus == null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'b2bBillStatus Not Found');
  }
  // let pending = b2bbillstatus.PendingExpenseAmount;
  let total = b2bbillstatus.totalExpenseAmount;
  let payamt = updateBody.payAmount;
  if (updateBody.mislianeousCost) {
    let cal = b2bbillstatus.mislianeousCost - updateBody.mislianeousCost;
    let totalupd = b2bbillstatus.PendingExpenseAmount - updateBody.mislianeousCost;
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { mislianeousCost: cal }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { PendingExpenseAmount: totalupd }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate(
      { _id: id },
      { payAmount: updateBody.mislianeousCost },
      { new: true }
    );
  }
  if (updateBody.logisticsCost) {
    let cal = b2bbillstatus.logisticsCost - updateBody.logisticsCost;
    let totalupd = b2bbillstatus.PendingExpenseAmount - updateBody.logisticsCost;
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { logisticsCost: cal }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { PendingExpenseAmount: totalupd }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate(
      { _id: id },
      { payAmount: updateBody.logisticsCost },
      { new: true }
    );
  }
  if (updateBody.others) {
    let cal = b2bbillstatus.others - updateBody.others;
    let totalupd = b2bbillstatus.PendingExpenseAmount - updateBody.others;
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { others: cal }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { PendingExpenseAmount: totalupd }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { payAmount: updateBody.others }, { new: true });
  }
  if (updateBody.All) {
    let cal = b2bbillstatus.totalExpenseAmount - updateBody.All;
    let totalupd = b2bbillstatus.PendingExpenseAmount - updateBody.All;
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { others: cal }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { PendingExpenseAmount: totalupd }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { paymentStatus: 'Paid' }, { new: true });
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { payAmount: updateBody.All }, { new: true });
  }
  let payAmountCal = b2bbillstatus.payAmount;
  let existTotal = b2bbillstatus.PendingExpenseAmount;
  let totalamt = payAmountCal - existTotal;

  if (totalamt == 0) {
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { paymentStatus: 'Paid' }, { new: true });
  }
  if (!totalamt == 0) {
    b2bbillstatus = await b2bBillStatus.findByIdAndUpdate({ _id: id }, { paymentStatus: 'H.Paid' }, { new: true });
  }
  return b2bbillstatus;
};

const getBilledDataForSupplierBills = async (date, page) => {
  let values = await b2bBillStatus.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        let: { confirmPrice: '$confirmprice', stockStatus: '$stockStatus' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $gt: ['$confirmprice', 0] }, { $eq: ['$stockStatus', 'Billed'] }],
              },
            },
          },
        ],
        as: 'callstatusData',
      },
    },
    {
      $unwind: '$callstatusData',
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'callstatusData.supplierid',
        foreignField: '_id',
        as: 'supplierData',
      },
    },
    {
      $unwind: '$supplierData',
    },
    {
      $project: {},
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let call = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i].callstatusData) call.push(values[i].callstatusData);
  }
  return { values: values, total: call.length, count: call.length };
};

module.exports = {
  createB2bBillStatus,
  getDataForAccountExecutive,
  ManageDeliveryExpenseBillEntry,
  getBilledDataForSupplierBills,
  getBillstatusById,
};
