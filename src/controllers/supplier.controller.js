const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const supplierService = require('../services/supplier.service');
const tokenService = require('../services/token.service');

const createSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(httpStatus.CREATED).send(supplier);
});

const UsersLogin = catchAsync(async (req, res) => {
  const users = await supplierService.UsersLogin(req.body);
  const tokens = await tokenService.generateAuthTokens(users);
  res.send({ users, tokens });
});

const getproductfromCallStatus = catchAsync(async (req, res) => {
  const getproduct = await supplierService.getproductfromCallStatus(req.params.date);
  res.send(getproduct);
});


const already_Customer = catchAsync(async (req, res) => {
  const data = await supplierService.already_Customer(req.body);
  res.send(data);
});

const getSupplierWithApprovedstatus = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierWithApprovedstatus(req.params.date);
  res.send(supplier);
});

const getAllSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.getAllSupplier();
  res.status(httpStatus.OK);
  res.send(supplier);
});

const getSupplierById = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.supplierId);
  if (!supplier || supplier.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not Found');
  }
  res.send(supplier);
});

const productDealingWithsupplier = catchAsync(async (req, res) => {
  const products = await supplierService.productDealingWithsupplier(req.params.id, req.params.date);
  res.send(products);
});

const getDisableSupplierById = catchAsync(async (req, res) => {
  const supplier = await supplierService.getDisableSupplierById(req.params.id);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not Found');
  }
  res.send(supplier);
});

const getproductsWithSupplierId = catchAsync(async (req, res) => {
  const supplier = await supplierService.getproductsWithSupplierId(req.params.supplierId, req.params.date);
  res.send(supplier);
});

const getAllDisableSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.getAllDisableSupplier();
  res.send(supplier);
});

const updateDisableSupplierById = catchAsync(async (req, res) => {
  const supplier = await supplierService.updateDisableSupplierById(req.params.id, req.body);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not Found');
  }
  res.send(supplier);
});

const updateSupplierById = catchAsync(async (req, res) => {
  const supplier = await supplierService.updateSupplierById(req.params.supplierId, req.body);
  if (!supplier || supplier.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not Found');
  }
  res.send(supplier);
});

const deleteSupplierById = catchAsync(async (req, res) => {
  const supplier = await supplierService.deleteSupplierById(req.params.supplierId);
  res.send();
});

const recoverById = catchAsync(async (req, res) => {
  const supplier = await supplierService.recoverById(req.params.supplierId);
  res.send(supplier);
});

const getSupplierAmountDetailsForSupplierBills = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierAmountDetailsForSupplierBills(req.params.page);
  res.send(supplier);
});

const getSupplierPaymentDetailsBySupplierId = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierPaymentDetailsBySupplierId(req.params.id);
  res.send(supplier);
});

const getSupplierPaymentDetailsByProductId = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierDataByProductId(req.params.id);
  res.send(supplier);
});

const getSupplierWith_Advanced = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierWith_Advanced();
  res.send(supplier);
});

const otpVerify_Setpassword = catchAsync(async (req, res) => {
  const getproduct = await supplierService.otpVerify_Setpassword(req.body);
  res.send(getproduct);
});

const Supplier_setPassword = catchAsync(async (req, res) => {
  const getproduct = await supplierService.Supplier_setPassword(req.params.id, req.body);
  res.send(getproduct);
});

const forgotPassword = catchAsync(async (req, res) => {
  const getproduct = await supplierService.forgotPassword(req.body);
  res.send(getproduct);
});

const getAllAppSupplier = catchAsync(async (req, res) => {
  let userId = req.userId;
  // //console.log(userId);
  const users = await supplierService.getAllAppSupplier(userId);
  res.send(users);
});

const getAllAppSupplierApproved = catchAsync(async (req, res) => {
  let userId = req.userId;
  // //console.log(userId);
  const users = await supplierService.getAllAppSupplierApproved(userId);
  res.send(users);
});

const getAllAppOnly_Supplier = catchAsync(async (req, res) => {
  let userId = req.userId;
  // //console.log(userId);
  const users = await supplierService.getAllAppOnly_Supplier(userId);
  res.send(users);
});

const getAllAppOnly_Supplier_Update = catchAsync(async (req, res) => {
  let userId = req.userId;
  const getproduct = await supplierService.getAllAppOnly_Supplier_Update(userId, req.body);
  res.send(getproduct);
});

// supplier Api's for third versions

const createSuppliers = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await supplierService.createSuppliers(req.body, userId);
  res.send(data);
});

const getSupplierthird = catchAsync(async (req, res) => {
  const data = await supplierService.getSupplierthird(req.params.key, req.params.page);
  res.send(data);
});

const updateSupplierthird = catchAsync(async (req, res) => {
  let userId = req.userId;
  let data = await supplierService.updateSupplierthird(req.params.id, req.body, userId);
  if (req.files) {
    data.image = [];
    req.files.forEach(function (files, index, arr) {
      data.image.push('images/supplier/' + files.filename);
    });
  }
  await data.save();
  res.send(data);
});

const UpdateSupplierByIdThird = catchAsync(async (req, res) => {
  let data = await supplierService.UpdateSupplierByIdThird(req.params.id, req.body);
  if (req.files) {
    data.image = [];
    req.files.forEach(function (files, index, arr) {
      data.image.push('images/supplier/' + files.filename);
    });
  }
  await data.save();
  res.send(data);
});

const getSupplierDetails = catchAsync(async (req, res) => {
  const data = await supplierService.getSupplierDetails(req.params.id);
  res.send(data);
});

const Store_lat_long = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await supplierService.Store_lat_long(req.params.id, req.body, userId);
  res.send(data);
});

const getSupplierWithverifiedUser = catchAsync(async (req, res) => {
  const data = await supplierService.getSupplierWithverifiedUser(req.params.key, req.params.date, req.params.page);
  res.send(data);
});

const checkMobileExestOrNot = catchAsync(async (req, res) => {
  const data = await supplierService.checkMobileExestOrNot(req.params.number);
  res.send(data);
});

const ValidateMobileNumber = catchAsync(async (req, res) => {
  const data = await supplierService.ValidateMobileNumber(req.params.id, req.params.phone);
  res.send(data);
});

const checkApproved = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await supplierService.checkApproved(userId);
  res.send(data);
});

const filter_supplier = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await supplierService.filter_supplier(userId);
  res.send(data);
});


const get_registered_supplier = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await supplierService.get_registered_supplier(userId);
  res.send(data);
});



module.exports = {
  createSupplier,
  getproductfromCallStatus,
  getAllSupplier,
  updateSupplierById,
  productDealingWithsupplier,
  recoverById,
  updateDisableSupplierById,
  getDisableSupplierById,
  getAllDisableSupplier,
  getproductsWithSupplierId,
  deleteSupplierById,
  getSupplierWithApprovedstatus,
  getSupplierById,
  getSupplierAmountDetailsForSupplierBills,
  getSupplierPaymentDetailsBySupplierId,
  getSupplierPaymentDetailsByProductId,
  getSupplierWith_Advanced,
  UsersLogin,
  otpVerify_Setpassword,
  Supplier_setPassword,
  forgotPassword,
  getAllAppSupplier,
  createSuppliers,
  getSupplierthird,
  updateSupplierthird,
  getSupplierDetails,
  getAllAppOnly_Supplier,
  getAllAppOnly_Supplier_Update,
  getAllAppSupplierApproved,
  Store_lat_long,
  getSupplierWithverifiedUser,
  checkMobileExestOrNot,
  UpdateSupplierByIdThird,
  ValidateMobileNumber,
  already_Customer,
  checkApproved,
  filter_supplier,
  get_registered_supplier
};
