const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const scvService = require('../services/scv.service');
const { relativeTimeRounding } = require('moment');
const ScvPartnerService = require('../services/scv.service');

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
  const data = await scvService.AddCart(req.body);
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
  const data = await scvService.getScvCarts();
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

const addScv = catchAsync(async (req, res) => {
  const data = await scvService.addScv(req.body);
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
};
