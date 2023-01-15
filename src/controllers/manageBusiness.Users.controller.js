const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const BusinessUsersService = require('../services/manageBusinessUsers.service');

const createBusinessUsers = catchAsync(async (req, res) => {
  const businessUsers = await BusinessUsersService.createBusinessUsers(req.body);
  if (req.files) {
    let path = '';
    path = 'images/BusersUpload/';
    if (req.files.idproof != null) {
      businessUsers.idproof =
        path +
        req.files.idproof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.addsproof != null) {
      businessUsers.addsproof =
        path +
        req.files.addsproof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.biodata != null) {
      businessUsers.biodata =
        path +
        req.files.biodata.map((e) => {
          return e.filename;
        });
    }
  }
  res.status(httpStatus.CREATED).send(businessUsers);
  await businessUsers.save();
});

const gettAllSuperAdminAssign = catchAsync(async (req, res) => {
  const superadmin = await BusinessUsersService.gettAllSuperAdminAssign();
  res.send(superadmin);
});

const getSuperAdminAssignById = catchAsync(async (req, res) => {
  const superAdmin = await BusinessUsersService.getSuperAdminAssignById(req.params.id);
  res.send(superAdmin);
});

const getAllUSers = catchAsync(async (req, res) => {
  const users = await BusinessUsersService.getAllUSers();
  res.send(users);
});

const getScvRole = catchAsync(async (req, res) => {
  const role = await BusinessUsersService.getScvRole();
  res.send(role);
});

const superAdminAggregation = catchAsync(async (req, res) => {
  const superAdmin = await BusinessUsersService.superAdminAggregation();
  if (!superAdmin) {
    throw new ApiError(httpStatus.NOT_Found, 'Assigning Ward Member Not Available');
  }
  res.send(superAdmin);
});

const createSuperAdminwardAssign = catchAsync(async (req, res) => {
  const businessUsers = await BusinessUsersService.createSuperAdminwardAssign(req.body);
  if (req.files) {
    let path = '';
    path = 'images/BusersUpload/';
    if (req.files.idproof != null) {
      businessUsers.idproof =
        path +
        req.files.idproof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.addsproof != null) {
      businessUsers.addsproof =
        path +
        req.files.addsproof.map((e) => {
          return e.filename;
        });
    }
    if (req.files.biodata != null) {
      businessUsers.biodata =
        path +
        req.files.biodata.map((e) => {
          return e.filename;
        });
    }
  }
  res.status(httpStatus.CREATED).send(businessUsers);
  await businessUsers.save();
});

const getBusinessUsersById = catchAsync(async (req, res) => {
  const busers = await BusinessUsersService.getBusinessUsersById(req.params.BUId);
  res.send(busers);
});

const getAllBusinessUsers = catchAsync(async (req, res) => {
  const busers = await BusinessUsersService.getAllBusinessUsers();
  if (!busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }
  res.send(busers);
});

const getSixRoles = catchAsync(async (req, res) => {
  const busers = await BusinessUsersService.getSixRoles();
  res.send(busers);
});

const updateBusinessUsers = catchAsync(async (req, res) => {
  const busers = await BusinessUsersService.updateBusinessUsers(req.params.BUId, req.body);
  if (!busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }
  res.send(busers);
});

const deleteBusinessUsers = catchAsync(async (req, res) => {
  const busers = await BusinessUsersService.deleteBusinessUsers(req.params.BUId);
  if (!busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }
  res.send(busers);
});
module.exports = {
  createBusinessUsers,
  getBusinessUsersById,
  superAdminAggregation,
  createSuperAdminwardAssign,
  getAllBusinessUsers,
  gettAllSuperAdminAssign,
  updateBusinessUsers,
  deleteBusinessUsers,
  getAllUSers,
  getScvRole,
  getSuperAdminAssignById,
  getSixRoles,
};
