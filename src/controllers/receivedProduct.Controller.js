const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ReceivedProductService = require('../services/receivedProduct.service');
const ReceivedStock = require('../models/receivedStock.model');
const CallStatus = require('../models/callStatus');
const moment = require('moment');

const createReceivedProduct = catchAsync(async (req, res) => {
  const currentDate = moment().format('YYYY-MM-DD');
  const currentTime = moment().format('HHmmss');

  let receivedProduct = await ReceivedProductService.createReceivedProduct({
    ...req.body,
    ...{ date: currentDate, time: currentTime, created: moment() },
  });
  if (receivedProduct) {
    req.body.callstatus.forEach(async (e) => {
      let callstatus = await CallStatus.findById(e.callstatusid);
      const row = {
        callstatusId: e.callstatusid,
        supplierId: req.body.supplierId,
        productId: callstatus.productid,
        date: currentDate,
        time: currentTime,
        groupId: receivedProduct.id,
        status: 'Acknowledged',
        created: moment(),
      };
      await ReceivedStock.create(row);
      await CallStatus.findByIdAndUpdate({ _id: e.callstatusid }, { StockReceived: 'Received' }, { new: true });
    });
  }
  res.send(receivedProduct);
});

const uploadImageById = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.uploadImageById(req.params.id, req.body);
  if (req.files) {
    let path = '';
    path = 'images/receivedproductimage/';
    //console.log(req.files.weighBridgeBillImg);
    if (req.files.weighBridgeBillImg != null) {
      req.files.weighBridgeBillImg.map((e) => {
        receivedProduct.weighBridgeBillImg.push(path + e.filename);
      });
    }
    if (req.files.supplierBillImg != null) {
      req.files.supplierBillImg.map((e) => {
        receivedProduct.supplierBillImg.push(path + e.filename);
      });
    }
  }
  await receivedProduct.save();
  res.send(receivedProduct);
});

const getAllWithPagination = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.getAllWithPagination(req.params.page, 'Acknowledged');
  res.send(receivedProduct);
});

const getAllWithPagination_loaded = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.getAllWithPagination(req.params.page, 'Loaded');
  res.send(receivedProduct);
});

const getAllWithPagination_billed = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.getAllWithPaginationBilled(req.params.page, 'Billed');
  res.send(receivedProduct);
});

const getAllWithPagination_billed_supplier = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.getAllWithPaginationBilled_Supplier(req.params.id, 'Billed');
  res.send(receivedProduct);
});

const updateReceivedProduct = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.updateReceivedProduct(req.params.id, req.body);
  res.send(receivedProduct);
});

const deleteReceivedOrdersById = catchAsync(async (req, res) => {
  const receivedProduct = await ReceivedProductService.deleteReceivedOrdersById(req.params.id);
  res.send(receivedProduct);
});

const BillNumber = catchAsync(async (req, res) => {
  const receivedProduct = await ReceivedProductService.BillNumber(req.params.id, req.body);
  res.send(receivedProduct);
});

const getSupplierBillsDetails = catchAsync(async (req, res) => {
  const receivedProduct = await ReceivedProductService.getSupplierBillsDetails(req.params.page, req.params.filter);
  res.send(receivedProduct);
});

const getreceivedProductBySupplier = catchAsync(async (req, res) => {
  const receivedProduct = await ReceivedProductService.getreceivedProductBySupplier(req.params.page);
  res.send(receivedProduct);
});

const getSupplierDetailByGroupId = catchAsync(async (req, res) => {
  const receicedProduct = await ReceivedProductService.getSupplierDetailByGroupId(req.params.id);
  res.send(receicedProduct);
});
const updaterandom_product = catchAsync(async (req, res) => {
  const receicedProduct = await ReceivedProductService.updaterandom_product(req.body);
  res.send(receicedProduct);
});

const getSupplierBillsDetails1 = catchAsync(async (req, res) => {
  const receivedProduct = await ReceivedProductService.getSupplierBillsDetails1(req.params.id, req.params.page);
  res.send(receivedProduct);
});

const getAllWithPagination_billed_supplier1 = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.getAllWithPaginationBilled_Supplier1(req.params.id, 'Billed');
  res.send(receivedProduct);
});

const previousOrderdata = catchAsync(async (req, res) => {
  let receivedProduct = await ReceivedProductService.previousOrderdata(req.params.id);
  res.send(receivedProduct);
});

const getbilled_Details = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await ReceivedProductService.getbilled_Details(req.query.page, userId);
  res.send(data);
});

const getBill_History = catchAsync(async (req, res) => {
  const data = await ReceivedProductService.getBill_History(req.params.id);
  res.send(data);
});

module.exports = {
  createReceivedProduct,
  getAllWithPagination,
  updateReceivedProduct,
  deleteReceivedOrdersById,
  getAllWithPagination_loaded,
  BillNumber,
  getAllWithPagination_billed,
  getAllWithPagination_billed_supplier,
  getSupplierBillsDetails,
  uploadImageById,
  getreceivedProductBySupplier,
  getSupplierDetailByGroupId,
  updaterandom_product,
  getSupplierBillsDetails1,
  getAllWithPagination_billed_supplier1,
  previousOrderdata,
  getbilled_Details,
  getBill_History,
};
