const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const metaUser = require('../models/userMeta.model');

const createMetaUSers = async (body) => {
  const users = await metaUser.create(body);
  return users;
};

const getmetaUserById = async (id) => {
  const users = await metaUser.find({ user_id: id });
  return users;
};

const updateMetaUsers = async (id, updateBody) => {
  let users = await metaUser.findById(id);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'USers not Found');
  }
  users = await metaUser.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return users;
};

const deleteMetaUser = async (id) => {
  let users = await metaUser.findById(id);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'users Not Found');
  }
  (users.active = false), (users.archive = true);
  await users.save();
};

module.exports = {
  createMetaUSers,
  getmetaUserById,
  updateMetaUsers,
  deleteMetaUser,
};
