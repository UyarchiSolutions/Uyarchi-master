const httpStatus = require('http-status');
const { Users } = require('../models/B2Busers.model');
const metaUsers = require('../models/userMeta.model');
const { Shop } = require('../models/b2b.ShopClone.model');
const Role = require('../models/roles.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const Textlocal = require('../config/textLocal');
const TextlocalChat = require('../config/chat-bot.OTP');
const Verfy = require('../config/OtpVerify');
const WardAssign = require('../models/wardAssign.model');
const { MarketClone } = require('../models/market.model');
const {OTP} = require('../models/saveOtp.model');
const ChatBotOTP = require('../models/chatBot.OTP.model');

const moment = require('moment');

const createUser = async (userBody) => {
  let value = Users.create(userBody);

  return value;
};

const getUsersById = async (id) => {
  let user = await Users.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users Not Found');
  }
  let role = await Role.findOne({ _id: user.userRole });
  return { userData: user, RoleData: role };
};

const getAllUsers = async (page) => {
  let values = await Users.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              roleName: 1,
            },
          },
        ],
        as: 'RoleData',
      },
    },
    {
      $unwind: '$RoleData',
    },
    {
      $lookup: {
        from: 'musers',
        localField: '_id',
        foreignField: 'user_id',
        as: 'metadatas',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        active: 1,
        salary: 1,
        dateOfJoining: 1,
        stepTwo: 1,
        createdAt: 1,
        userrole: '$RoleData.roleName',
        metavalue: '$metadatas',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Users.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              roleName: 1,
            },
          },
        ],
        as: 'RoleData',
      },
    },
    {
      $unwind: '$RoleData',
    },
    {
      $lookup: {
        from: 'musers',
        localField: '_id',
        foreignField: 'user_id',
        as: 'metadatas',
      },
    },
  ]);
  return { values: values, total: total.length };
};
const UsersLogin = async (userBody) => {
  const { phoneNumber, password } = userBody;
  let userName = await Users.findOne({ phoneNumber: phoneNumber });
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone Number Not Registered');
  } else {
    if (await userName.isPasswordMatch(password)) {
      //console.log('Password Macthed');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  return userName;
};
const B2bUsersAdminLogin = async (userBody) => {
  const { phoneNumber, password } = userBody;
  //console.log(password);
  const salt = await bcrypt.genSalt(7);
  let passwor = { password: await bcrypt.hash(password.toString(), salt) };
  //console.log(passwor);
  let userName = await Users.findOne({
    phoneNumber: phoneNumber,
    $or: [
      { userRole: 'fb0dd028-c608-4caa-a7a9-b700389a098d' },
      { userRole: '33a2ff87-400c-4c15-b607-7730a79b49a9' },
      { userRole: '36151bdd-a8ce-4f80-987e-1f454cd0993f' },
      { userRole: '57243437-a1d4-426f-a705-5da92a630d15' },
      { userRole: '24a28b34-ae15-4f3a-a3e8-24cf5b7be5a1' },
      { userRole: '569d9d3f-285c-434d-99e7-0c415245c40c' },
      { userRole: '719d9f71-8388-4534-9bfe-3f47faed62ac' },
    ],
    stepTwo: true,
    active: true,
  });
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone Number Not Registered');
  } else {
    //console.log(await userName.isPasswordMatch(password));
    if (await userName.isPasswordMatch(password)) {
      //console.log('Password Macthed');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  return userName;
};
const createMetaUsers = async (userBody) => {
  const user = await metaUsers.create(userBody);
  return user;
};
const forgotPassword = async (body) => {
  let users = await Users.findOne({
    phoneNumber: body.mobileNumber,
    active: true,
    $or: [
      { userRole: 'fb0dd028-c608-4caa-a7a9-b700389a098d' },
      { userRole: '33a2ff87-400c-4c15-b607-7730a79b49a9' },
      { userRole: '36151bdd-a8ce-4f80-987e-1f454cd0993f' },
      { userRole: '57243437-a1d4-426f-a705-5da92a630d15' },
      { userRole: '24a28b34-ae15-4f3a-a3e8-24cf5b7be5a1' },
      { userRole: '569d9d3f-285c-434d-99e7-0c415245c40c' },
      { userRole: '719d9f71-8388-4534-9bfe-3f47faed62ac' },
    ],
  });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  return await Textlocal.Otp(body, users);
};

const chatBotOtp = async (body) => {
  let user = { name: 'chatBotUser' };
  return await TextlocalChat.Otp(body, user);
};

const chatBotOtpVerify = async (body) => {
  let findOtp = await ChatBotOTP.findOne({ OTP: body.otp, used: false, date: moment().format('YYYY-MM-DD') });
  if (!findOtp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Otp Not Valid');
  }
  findOtp = await ChatBotOTP.findByIdAndUpdate({ _id: findOtp._id }, { used: true }, { new: true });
  return findOtp;
};

const otpVerfiy = async (body) => {
  let users = await Users.findOne({
    phoneNumber: body.mobileNumber,
    active: true,
    $or: [
      { userRole: 'fb0dd028-c608-4caa-a7a9-b700389a098d' },
      { userRole: '33a2ff87-400c-4c15-b607-7730a79b49a9' },
      { userRole: '36151bdd-a8ce-4f80-987e-1f454cd0993f' },
      { userRole: '57243437-a1d4-426f-a705-5da92a630d15' },
      { userRole: '24a28b34-ae15-4f3a-a3e8-24cf5b7be5a1' },
      { userRole: '569d9d3f-285c-434d-99e7-0c415245c40c' },
      { userRole: '719d9f71-8388-4534-9bfe-3f47faed62ac' },
    ],
  });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  //console.log(users)
  return await Verfy.verfiy(body, users);
};

const otpVerfiyPurchaseExecutive = async (body) => {
  let users = await Users.findOne({
    phoneNumber: body.mobileNumber,
  });
  let otp = await ChatBotOTP.findOne({ OTP: body.OTP, used: false });
  //console.log(otp);
  if (!users || otp == null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  await ChatBotOTP.findOneAndUpdate({ _id: otp._id }, { used: true }, { new: true });
  users = await Users.findOneAndUpdate({ _id: users._id }, { otpVerified: true }, { new: true });
  return users;
};

const PurchaseExecutive_setPassword = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await Users.findOneAndUpdate({ _id: id, otpVerified: true }, { password: password1 }, { new: true });
  return data;
};

const getForMyAccount = async (userId) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: userId } }],
      },
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
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        roleName: '$RoleData.roleName',
        description: '$RoleData.description',
      },
    },
  ]);
  return values;
};

const getsalesExecuteRolesUsers = async () => {
  let users = await Users.find({
    userRole: ['fb0dd028-c608-4caa-a7a9-b700389a098d', '719d9f71-8388-4534-9bfe-3f47faed62ac'],
  });
  return users;
};

const changePassword = async (userId, body) => {
  let user = await Users.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  const salt = await bcrypt.genSalt(10);
  let { password } = body;
  password = await bcrypt.hash(password, salt);
  user = await Users.findByIdAndUpdate({ _id: userId }, { password: password }, { new: true });
  return user;
};

const getAllmetaUsers = async () => {
  return metaUsers.find();
};

const getusermetaDataById = async (id) => {
  const metauser = await metaUsers.findById(id);
  return metauser;
};

const updateMetaUsers = async (id, updateBody) => {
  let metauser = await getusermetaDataById(id);
  //console.log(metauser);
  if (!metauser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  metauser = await metaUsers.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return metauser;
};

const deleteMetaUser = async (id) => {
  let metauser = await getusermetaDataById(id);
  if (!metauser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'not Found');
  }
  (metauser.active = false), (metauser.archive = true), await metauser.save();
};

const updatemetadata = async (updateBody) => {
  updateBody.metavalue.forEach(async (e) => {
    const metauser = await metaUsers.findOne({ user_id: updateBody.userId, metaKey: e.key });
    let update = {
      user_id: updateBody.userId,
      metaKey: e.key,
      metavalue: e.value,
    };
    await Users.findOneAndUpdate({ _id: updateBody.userId }, { stepTwo: true }, { new: true });
    if (metauser) {
      await metaUsers.findByIdAndUpdate({ _id: metauser.id }, update, { new: true });
    } else {
      await metaUsers.create(update);
    }
  });

  // let assign = updateBody.assign.forEach(async (e) => {
  //   let servercreatetime = moment().format('hh:mm a');
  //   let serverdate = moment().format('DD-MM-yyy');
  //   // const assigns = await WardAssign.findOne({
  //   //   user_id: updateBody.userId,
  //   //   key: e.key,
  //   //   value: e.value,
  //   //   assignStatus: 'Assigned',
  //   // });
  //   // if (!assigns) {
  //   //   throw new ApiError(httpStatus.NOT_FOUND, 'WardAssign not Found');
  //   // }
  //   let update = {
  //     userId: updateBody.userId,
  //     key: e.key,
  //     value: e.value,
  //   };
  //   let values = { ...update, ...{ date: serverdate, time: servercreatetime } };
  //   await WardAssign.create(values);
  // });
  return 'success';
};

const updateB2bUsers = async (id, updateBody) => {
  let User = await Users.findById(id);
  if (!User) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users Not Found');
  }
  User = await Users.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return User;
};

const getUsersDataById = async (id) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              roleName: 1,
            },
          },
        ],
        as: 'RoleData',
      },
    },
    {
      $unwind: '$RoleData',
    },
    {
      $lookup: {
        from: 'musers',
        localField: '_id',
        foreignField: 'user_id',
        as: 'metadatas',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        active: 1,
        salary: 1,
        dateOfJoining: 1,
        stepTwo: 1,
        createdAt: 1,
        userrole: '$RoleData.roleName',
        userRole: 1,
        metavalue: '$metadatas',
      },
    },
  ]);
  return values;
};

const deleteB2bUsersbyId = async (id) => {
  let users = await Users.findById(id);
  // if (!users) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Users Not Found');
  // }
  // await Shop.updateMany({ Uid: id }, { $set: { Uid: '3625a112-a7f5-4bd8-b9c3-f86ae03c2f44' } }, { new: true });
  // await MarketClone.updateMany({ Uid: id }, { $set: { Uid: '3625a112-a7f5-4bd8-b9c3-f86ae03c2f44' } }, { new: true });
  // users = await Users.deleteOne({ _id: id });
  return users;
};

const shopverification = async (id) => {
  let users = await Users.findById(id);
  show = false;
  if (users.userRole == 'fb0dd028-c608-4caa-a7a9-b700389a098d') {
    show = true;
  }
  return { show: show };
};

const getrolebyuser_user = async (id) => {
  let users = await Users.find({ userRole: id });
  return users;
};

const gettargetedusers = async (id) => {
  let users = await Users.find({
    userRole: { $in: ['fb0dd028-c608-4caa-a7a9-b700389a098d', '33a2ff87-400c-4c15-b607-7730a79b49a9'] },
  });
  return users;
};

const gettargetedusers_credit = async (id) => {
  let users = await Users.find({
    userRole: { $in: ['36151bdd-a8ce-4f80-987e-1f454cd0993f', 'fb0dd028-c608-4caa-a7a9-b700389a098d'] },
  });
  return users;
};

const get_stationery_user = async (id) => {
  let users = await Users.aggregate([
    {
      $match: { userRole: { $in: ['ea1d0203-56fa-44f7-a1fb-73d3d5c3eac5'] } },
    },
    {
      $lookup: {
        from: 'wardadmingroups',
        localField: '_id',
        foreignField: 'deliveryExecutiveId',
        pipeline: [{ $match: { manageDeliveryStatus: { $ne: 'Delivery Completed' } } }],
        as: 'wardadmingroups',
      },
    },
    {
      $project: {
        _id: 1,
        phoneNumber: 1,
        name: 1,
        email: 1,
        wardadmingroups: { $size: '$wardadmingroups' },
      },
    },
    { $match: { wardadmingroups: { $eq: 0 } } },
  ]);
  return users;
};

const get_drivers_all = async (id) => {
  let users = await Users.aggregate([
    {
      $match: { userRole: { $in: ['d7d33955-c66f-4a45-b859-a41122a84b24'] } },
    },
    {
      $project: {
        _id: 1,
        phoneNumber: 1,
        name: 1,
        email: 1,
      },
    },
  ]);
  return users;
};

const deliveryExecutive = async () => {
  let values = await Users.find({ userRole: '36151bdd-a8ce-4f80-987e-1f454cd0993f' });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'There is no Delivery executive');
  }
  return values;
};

const PurchaseExecutivelogin = async (userBody) => {
  const { phoneNumber, password } = userBody;
  let userName = await Users.findOne({ phoneNumber: phoneNumber });
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone Number Not Registered');
  } else {
    if (await userName.isPasswordMatch(password)) {
      //console.log('Password Macthed');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  //console.log(userName);
  if (userName.userRole !== '3fd66c17-d85b-4cd4-af96-ac8173d8a830') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Role');
  }
  return userName;
};

const sendOTP = async (body) => {
  const { mobileNumber } = body;
  let users = await Users.findOne({ phoneNumber: body.mobileNumber, active: true });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users Not Found');
  }
  return Textlocal.Otp(body, users);
};

const supplierEnroll = async () => {
  let values = await Users.find({ userRole: '3fd66c17-d85b-4cd4-af96-ac8173d8a830' });
  if (!values) {
    throw new ApiError('there no user in this Role');
  }
  return values;
};

const getUserAttendance = async (page) => {
  let values = await Users.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $unwind: '$roles',
    },
    {
      $project: {
        _id: 1,
        isEmailVerified: 1,
        active: 1,
        name: 1,
        email: 1,
        salary: 1,
        role: '$roles.roleName',
      },
    },
    {
      $skip: 10 * page,
    },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'userRole',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $unwind: '$roles',
    },
    {
      $project: {
        _id: 1,
        isEmailVerified: 1,
        active: 1,
        name: 1,
        email: 1,
        salary: 1,
        role: '$roles.roleName',
      },
    },
  ]);

  return { values: values, total: total.length };
};

const getFines_Details = async (id) => {
  let values = await Users.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'executivefines',
        localField: '_id',
        foreignField: 'userId',
        pipeline: [{ $group: { _id: { month: { $month: '$created' } }, totalAmount: { $sum: '$fineAmount' } } }],
        as: 'BillVerification',
      },
    },
    {
      $unwind: '$BillVerification',
    },
    {
      $lookup: {
        from: 'creditbillgroups',
        localField: '_id',
        foreignField: 'AssignedUserId',
        pipeline: [
          { $match: { fineStatus: 'Fine' } },
          { $group: { _id: { month: { $month: '$finishDate' } }, totalAmount: { $sum: '$disputeAmount' } } },
        ],
        as: 'crediteFine',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$crediteFine',
      },
    },
  ]);
  return values;
};

module.exports = {
  createUser,
  UsersLogin,
  B2bUsersAdminLogin,
  createMetaUsers,
  updateMetaUsers,
  getAllUsers,
  deleteMetaUser,
  getAllmetaUsers,
  changePassword,
  getUsersById,
  getusermetaDataById,
  getForMyAccount,
  getsalesExecuteRolesUsers,
  updatemetadata,
  forgotPassword,
  otpVerfiy,
  updateB2bUsers,
  getUsersDataById,
  deleteB2bUsersbyId,
  shopverification,
  getrolebyuser_user,
  gettargetedusers,
  gettargetedusers_credit,
  get_stationery_user,
  get_stationery_user,
  get_drivers_all,
  deliveryExecutive,
  PurchaseExecutivelogin,
  sendOTP,
  otpVerfiyPurchaseExecutive,
  PurchaseExecutive_setPassword,
  supplierEnroll,
  getUserAttendance,
  getFines_Details,
  chatBotOtp,
  chatBotOtpVerify,
};
