const httpStatus = require('http-status');
const { ManageBusinessUser, SuperAdminAssignWardMember } = require('../models/manageBusinessUsers.model');
const ApiError = require('../utils/ApiError');
const Roles = require('../models/roles.model');
const createBusinessUsers = async (BUsersbody) => {
  // let { role } = BUsersbody
  // let value = {}
  // role = ['Ward admin(WA)', 'Ward loading execute(WLE)', 'Ward delivery execute(WDE)', 'Ward admin Bill execute(WABE)', 'Ward admin Account execute(WAAE)', 'Ward admin Operations execute(WAOPE)']
  // value = {...BUsersbody, ...{role}}

  return ManageBusinessUser.create(BUsersbody);
};

const createSuperAdminwardAssign = async (body) => {
  return await SuperAdminAssignWardMember.create(body);
};

const getAllUSers = async () => {
  return await SuperAdminAssignWardMember.find();
};

const gettAllSuperAdminAssign = async () => {
  return await SuperAdminAssignWardMember.find({ roletype: 'Street Cart Vendor' });
};

const superAdminAggregation = async () => {
  return await SuperAdminAssignWardMember.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'roletype',
        foreignField: '_id',
        as: 'rolesData',
      },
    },
    {
      $unwind: '$rolesData',
    },
    {
      $project: {
        RoleName: '$rolesData.roleName',
        uname: 1,
      },
    },
  ]);
};

const getSuperAdminAssignById = async (id) => {
  const superAdmin = await SuperAdminAssignWardMember.findById(id);
  if (!superAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Super Admin Ward Assign Not Found');
  }
  return superAdmin;
};

const getSixRoles = async () => {
  const role = await Roles.find({ adminWardAssign: true });
  return role;
};

const getScvRole = async () => {
  const role = await Roles.find({ description: 'SCV' });
  return role;
};
const getBusinessUsersById = async (BUId) => {
  const Busers = await ManageBusinessUser.findById(BUId);
  if (!Busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }
  return Busers;
};

const getAllBusinessUsers = async () => {
  return ManageBusinessUser.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'roletype',
        foreignField: '_id',
        as: 'rolesData',
      },
    },
    {
      $unwind: '$rolesData',
    },
    {
      $project: {
        RoleName: '$rolesData.roleName',
        uname: 1,
      },
    },
  ]);
};

const updateBusinessUsers = async (BUId, updateBody) => {
  const busers = await getBusinessUsersById(BUId);
  if (!busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }

  busers = await ManageBusinessUser.findOneAndUpdate({ _id: BUId }, updateBody, { new: true });
  await busers.save();
  return busers;
};

const deleteBusinessUsers = async (BUId) => {
  const busers = await getBusinessUsersById(BUId);
  if (!busers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business Users Not Found');
  }
  (busers.active = false), (busers.archive = true);
  await busers.save();
  return busers;
};

module.exports = {
  createBusinessUsers,
  getBusinessUsersById,
  superAdminAggregation,
  getAllBusinessUsers,
  updateBusinessUsers,
  getSuperAdminAssignById,
  createSuperAdminwardAssign,
  getScvRole,
  getAllUSers,
  gettAllSuperAdminAssign,
  getSixRoles,
  deleteBusinessUsers,
};
