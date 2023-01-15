const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const metaUserService = require('../services/metauser.service');

const createMetaUSers = catchAsync(async (req, res) => {
  const users = await metaUserService.createMetaUSers(req.body);
  res.send(users);
});

const getmetaUserById = catchAsync(async (req, res) => {
  const users = await metaUserService.getmetaUserById(req.params.id);
  res.send(users);
});

const updateMetauser = catchAsync(async (req, res) => {
  const users = await metaUserService.updateMetaUsers(req.params.id, req.body);
  res.send(users);
});

const deleteMetaUser = catchAsync(async (req, res) => {
  const users = await metaUserService.deleteMetaUser(req.params.id);
  res.send();
});

module.exports = {
  createMetaUSers,
  getmetaUserById,
  updateMetauser,
  deleteMetaUser,
};
