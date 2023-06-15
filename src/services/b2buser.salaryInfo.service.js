const httpStatus = require('http-status');
const B2bUserSalaryInfo = require('../models/b2buserSalaryInfo.model');
const ApiError = require('../utils/ApiError');

const createB2bSalaryInfo = async (body) => {
  let creation = await B2bUserSalaryInfo.create(body);
  return creation;
};

const getAllDataWithAggregation = async (page) => {
  let values = await B2bUserSalaryInfo.aggregate([
    {
      $lookup: {
        from: 'b2busers',
        localField: 'userId',
        foreignField: '_id',
        as: 'UserDatadata',
      },
    },
    {
      $unwind: '$UserDatadata',
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        as: 'RoleData',
      },
    },
    {
      $unwind: '$RoleData',
    },
    { $skip: 10 * page },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        salary: 1,
        userStatus: 1,
        Type: 1,
        empId: 1,
        role: '$RoleData.roleName',
        userName: '$UserDatadata.name',
      },
    },
  ]);
  let total = await B2bUserSalaryInfo.find({ active: true }).count();
  return { values: values, total: total };
};

const updateuserStatus = async (id) => {
  let b2buserSalary = await B2bUserSalaryInfo.findById(id);
  if (!b2buserSalary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'B2bUserSalaryInfo Not Found');
  }
  //console.log(b2buserSalary.userStatus);
  if (b2buserSalary.userStatus == 'Active') {
    b2buserSalary = await B2bUserSalaryInfo.findByIdAndUpdate({ _id: id }, { userStatus: 'Passive' }, { new: true });
  } else {
    b2buserSalary = await B2bUserSalaryInfo.findByIdAndUpdate({ _id: id }, { userStatus: 'Active' }, { new: true });
  }
  return b2buserSalary;
};

const getActiveUsers = async () => {
  let values = await B2bUserSalaryInfo.aggregate([
    {
      $match: {
        $and: [{ userStatus: { $eq: 'Active' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },

    {
      $project: {
        userId: '$userData._id',
        userName: '$userData.name',
        userStatus: 1,
        empId: 1,
        salary: 1,
      },
    },
  ]);
  return values;
};

module.exports = {
  createB2bSalaryInfo,
  getAllDataWithAggregation,
  updateuserStatus,
  getActiveUsers,
};
