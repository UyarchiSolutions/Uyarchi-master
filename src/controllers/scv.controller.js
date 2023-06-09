const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const scvService = require('../services/scv.service');
const { relativeTimeRounding } = require('moment');
const ScvPartnerService = require('../services/scv.service');
const { tokenService } = require('../services');

const createSCV = catchAsync(async (req, res) => {
  const scv = await scvService.createSCV(req.body);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, ' SCV Not Fount.');
  }
  res.status(httpStatus.CREATED).send(scv);
});

// const getBusinessDetails = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['salesProduct', 'shippingCost']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await BusinessService.queryBusiness(filter, options);
//   res.send(result);
// });

const getSCVById = catchAsync(async (req, res) => {
  const scv = await scvService.getSCVById(req.params.scvId);
  if (!scv || scv.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'scv not found');
  }
  res.send(scv);
});

const gertAllSCV = catchAsync(async (req, res) => {
  const scv = await scvService.getAllSCV(req.params);
  if (!scv) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SVC Not Found');
  }
  res.send(scv);
});

const updateSCV = catchAsync(async (req, res) => {
  const scv = await scvService.updateSCVById(req.params.scvId, req.body);
  res.send(scv);
});

const deletescv = catchAsync(async (req, res) => {
  await scvService.deleteSCVById(req.params.scvId);
  res.status(httpStatus.NO_CONTENT).send();
});

const AddCart = catchAsync(async (req, res) => {
  const userId = req.userId;
  const data = await scvService.AddCart(req.body, userId);
  let path = '';
  path = 'images/partnercart/';
  if (req.file != null) {
    data.image = path + req.file.filename;
  }
  await data.save();
  res.status(httpStatus.CREATED).send(data);
});

const DisableCart = catchAsync(async (req, res) => {
  const data = await scvService.DisableCart(req.params.id);
  res.send(data);
});

const getScvCarts = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await scvService.getScvCarts(userId);
  res.send(data);
});

const updateSCVCart = catchAsync(async (req, res) => {
  const data = await scvService.updateSCVCart(req.params.id, req.body);
  let path = '';
  path = 'images/partnercart/';
  if (req.file != null) {
    data.image = path + req.file.filename;
  }
  await data.save();
  res.send(data);
});

const cartOn = catchAsync(async (req, res) => {
  const data = await scvService.cartOn(req.params.id, req.body);
  res.send(data);
});

const addScv = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await scvService.addScv(req.body, userId);
  if (req.files != null) {
    if (req.files.addreddProof != null) {
      let path = 'images/scvAdress/';
      data.addreddProof = path + req.files.addreddProof[0].filename;
    }
    if (req.files.idProof != null) {
      let path = 'images/scvAdress/';
      data.idProof = path + req.files.idProof[0].filename;
    }
  }
  await data.save();
  res.send(data);
});

const updateSCVByPartner = catchAsync(async (req, res) => {
  const data = await scvService.updateSCVByPartner(req.params.id, req.body);
  if (req.files != null) {
    if (req.files.addreddProof != null) {
      let path = 'images/scvAdress/';
      data.addreddProof = path + req.files.addreddProof[0].filename;
    }
    if (req.files.idProof != null) {
      let path = 'images/scvAdress/';
      data.idProof = path + req.files.idProof[0].filename;
    }
  }
  await data.save();
  res.send(data);
});

const create_scv = catchAsync(async (req, res) => {
  const data = await scvService.create_scv(req.body);
  if (req.files != null) {
    if (req.files.addreddProof != null) {
      let path = 'images/scvAdress/';
      data.addreddProof = path + req.files.addreddProof[0].filename;
    }
    if (req.files.idProof != null) {
      let path = 'images/scvAdress/';
      data.idProof = path + req.files.idProof[0].filename;
    }
  }
  await data.save();
  res.send(data);
});

const active_Inactive_Scv_ByPartner = catchAsync(async (req, res) => {
  const data = await scvService.active_Inactive_Scv_ByPartner(req.params.id, req.body);
  res.send(data);
});

const getAllScvByPartners = catchAsync(async (req, res) => {
  const userId = req.userId;
  const data = await scvService.getAllScvByPartners(userId);
  res.send(data);
});

const getcarts_Allocation = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await scvService.getcarts_Allocation(userId);
  res.send(data);
});

const getAvailable_Scv = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await scvService.getAvailable_Scv(userId);
  res.send(data);
});

const AllocationScv_ToCart = catchAsync(async (req, res) => {
  const data = await scvService.AllocationScv_ToCart(req.body);
  res.send(data);
});

const SCVAttendance = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await scvService.SCVAttendance(userId);
  res.send(data);
});

const RegisterScv = catchAsync(async (req, res) => {
  const data = await scvService.RegisterScv(req.body);
  res.send(data);
});

const Otpverify = catchAsync(async (req, res) => {
  const data = await scvService.Otpverify(req.body);
  res.send(data);
});

const setPassword = catchAsync(async (req, res) => {
  const data = await scvService.setPassword(req.body);
  res.send(data);
});

const LoginCustomer = catchAsync(async (req, res) => {
  const data = await scvService.LoginCustomer(req.body);
  const token = await tokenService.generateAuthTokens(data);
  res.send({ data: data, token: token });
});

const getScvCartbyId = catchAsync(async (req, res) => {
  const data = await scvService.getScvCartbyId(req.params.id);
  res.send(data);
});

const addPartner = catchAsync(async (req, res) => {
  const data = await scvService.addPartner(req.body);
  if (req.files != null) {
    if (req.files.addressProof != null) {
      let path = 'images/partnerAddress/';
      data.addressProof = path + req.files.addressProof[0].filename;
    }
    if (req.files.idProof != null) {
      let path = 'images/partnerAddress/';
      data.idProof = path + req.files.idProof[0].filename;
    }
  }
  await data.save();
  res.send(data);
});

const getPartners = catchAsync(async (req, res) => {
  const data = await scvService.getPartners();
  res.send(data);
});

const updatePartner = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.updatePartner(req.params.id, req.body);
  if (req.files != null) {
    if (req.files.addressProof != null) {
      let path = 'images/partnerAddress/';
      data.addressProof = path + req.files.addressProof[0].filename;
    }
    if (req.files.idProof != null) {
      let path = 'images/partnerAddress/';
      data.idProof = path + req.files.idProof[0].filename;
    }
  }
  await data.save();
  res.send(data);
});

const enable_disable_partner = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.enable_disable_partner(req.params.id, req.body);
  res.send(data);
});

const get_Un_Assigned_Scv = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.get_Un_Assigned_Scv();
  res.send(data);
});

const allocateSCV_To_Partner_ByAdmin = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.allocateSCV_To_Partner_ByAdmin(req.body);
  res.send(data);
});

const getAllscv_Admin = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.getAllscv_Admin();
  res.send(data);
});

const scv_attendance = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.scv_attendance(req.body);
  res.send(data);
});

const getScv_Attendance_Reports = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.getScv_Attendance_Reports(req.body);
  res.send(data);
});

const getCartBy_Allocated_Scv = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.getCartBy_Allocated_Scv(req.params.id);
  res.send(data);
});

const Remove__ScvFrom_Cart = catchAsync(async (req, res) => {
  const data = await ScvPartnerService.Remove__ScvFrom_Cart(req.body);
  res.send(data);
});

module.exports = {
  createSCV,
  getSCVById,
  gertAllSCV,
  updateSCV,
  deletescv,
  AddCart,
  DisableCart,
  getScvCarts,
  updateSCVCart,
  addScv,
  updateSCVByPartner,
  getAllScvByPartners,
  active_Inactive_Scv_ByPartner,
  getcarts_Allocation,
  getAvailable_Scv,
  AllocationScv_ToCart,
  SCVAttendance,
  RegisterScv,
  Otpverify,
  setPassword,
  LoginCustomer,
  getScvCartbyId,
  addPartner,
  getPartners,
  updatePartner,
  enable_disable_partner,
  create_scv,
  get_Un_Assigned_Scv,
  allocateSCV_To_Partner_ByAdmin,
  getAllscv_Admin,
  scv_attendance,
  getScv_Attendance_Reports,
  cartOn,
  getCartBy_Allocated_Scv,
  Remove__ScvFrom_Cart,
};
