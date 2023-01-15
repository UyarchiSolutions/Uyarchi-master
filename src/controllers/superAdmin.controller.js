const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const SuperAdminService = require('../services/superAdmin.service');
const { tokenService } = require('../services');

const createSuperAdmin = catchAsync(async (req, res) => {
  const superAdmin = await SuperAdminService.createSuperAdmin(req.body);
  if (req.files) {
    let path = '';
    path = 'images/superAdmin/';
    if (req.files.idProof != null) {
      superAdmin.idProof =
        path +
        req.files.idProof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.addressProof != null) {
      superAdmin.addressProof =
        path +
        req.files.addressProof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.bioData != null) {
      superAdmin.bioData =
        path +
        req.files.bioData.map((e) => {
          return e.filename;
        });
    }
  }
  res.status(httpStatus.CREATED).send(superAdmin);
  await superAdmin.save();
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const superAdmin = await SuperAdminService.loginSuperAdminWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(superAdmin);
  res.send({ superAdmin, tokens });
});

const getSuperAdminById = catchAsync(async (req, res) => {
  const vendor = await VendorService.getVendorById(req.params.vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  res.send(vendor);
});

const superAdminList = catchAsync(async (req, res) => {
  const results = await SuperAdminService.listSuperAdmin();
  res.send(results);
});

const updateSuperAdminById = catchAsync(async (req, res) => {
  const superAdmin = await SuperAdminService.updatesuperAdminById(req.params.superAdminId, req.body);
  res.send(superAdmin);
});

const resetPassword = catchAsync(async (req, res) => {
  await SuperAdminService.resetPassword(req.params.superAdminId, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  await SuperAdminService.changePassword(req.params.superAdminId, req.body.oldPassword, req.body.newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSuperAdmin,
  getSuperAdminById,
  login,
  superAdminList,
  updateSuperAdminById,
  changePassword,
  resetPassword,
};
