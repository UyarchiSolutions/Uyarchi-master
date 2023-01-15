const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const manageUserService = require('../services/manageUser.service');
const { tokenService } = require('../services');

const createmanageUserService = catchAsync(async (req, res) => {
  const user = await manageUserService.createManageUser(req.body);
  if (req.files) {
    let path = '';
    path = 'images/proofs/';
    if (req.files.idProofUpload != null) {
      user.idProofUpload =
        path +
        req.files.idProofUpload.map((e) => {
          return e.filename;
        });
    }
    if (req.files.addressProofUpload != null) {
      user.addressProofUpload =
        path +
        req.files.addressProofUpload.map((e) => {
          return e.filename;
        });
    }
    if (req.files.twoWheelerUpload != null) {
      user.twoWheelerUpload =
        path +
        req.files.twoWheelerUpload.map((e) => {
          return e.filename;
        });
    }
  }
  res.status(httpStatus.CREATED).send(user);
  await user.save();
});

const login = catchAsync(async (req, res) => {
  const { mobileNumber, dateOfBirth } = req.body;
  const interviewerRegistration = await manageUserService.loginManageUserEmailAndPassword(mobileNumber, dateOfBirth);
  const tokens = await tokenService.generateAuthTokens(interviewerRegistration[0]);
  let options = {
    httpOnly: true,
  };
  res.cookie('token', tokens.access.token, options);
  // jwt.verify(req.cookies['token'],);
  res.send({ interviewerRegistration, tokens });
});

const getmanageUserServiceById = catchAsync(async (req, res) => {
  const pro = await manageUserService.getManageUserById(req.params.manageUserId);
  if (!pro || pro.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'manageUser not found');
  }
  res.send(pro);
});

const getmanageUserServiceByIdstatus = catchAsync(async (req, res) => {
  const pro = await manageUserService.getManageUserdataByIdStatus(
    req.params.id,
    req.params.streetId,
    req.params.status,
    req.params.page
  );
  // if (!pro || pro.active === false) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'manageUser not found');
  // }
  res.send(pro);
});

const getmanageUserServiceAll = catchAsync(async (req, res) => {
  const manage = await manageUserService.ManageUserAll(req.params);
  if (!manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'manageUser Not Available ');
  }
  res.send(manage);
});

const getmanageUserServiceAllenable = catchAsync(async (req, res) => {
  const manage = await manageUserService.ManageUserAllenable(req.params);
  if (!manage) {
    res.status(httpStatus.NOT_FOUND);
  }
  res.send(manage);
});

const getAllManageUserTable = catchAsync(async (req, res) => {
  const manage = await manageUserService.manageUserAllTable(
    req.params.id,
    req.params.districtId,
    req.params.zoneId,
    req.params.wardId,
    req.params.status,
    req.params.page
  );
  if (!manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'manageUser Not Available ');
  }
  res.send(manage);
});

const updatemanageUserService = catchAsync(async (req, res) => {
  const pro = await manageUserService.updateManageUserId(req.params.manageUserId, req.body);
  if (req.files) {
    let path = '';
    path = 'images/proofs/';
    if (req.files.idProofUpload != null) {
      pro.idProofUpload =
        path +
        req.files.idProofUpload.map((e) => {
          return e.filename;
        });
    }
    if (req.files.addressProofUpload != null) {
      pro.addressProofUpload =
        path +
        req.files.addressProofUpload.map((e) => {
          return e.filename;
        });
    }
    if (req.files.twoWheelerUpload != null) {
      pro.twoWheelerUpload =
        path +
        req.files.twoWheelerUpload.map((e) => {
          return e.filename;
        });
    }
  }
  res.send(pro);
  await pro.save();
});

const deletemanageUserService = catchAsync(async (req, res) => {
  await manageUserService.deleteManageUserById(req.params.manageUserId);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  createmanageUserService,
  getmanageUserServiceAll,
  getmanageUserServiceById,
  updatemanageUserService,
  deletemanageUserService,
  login,
  getAllManageUserTable,
  getmanageUserServiceAllenable,
  getmanageUserServiceByIdstatus,
};
