const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { ScvCart, Scv, Customer, ScvAttendance } = require('../models/Scv.mode');
const CustomerOTP = require('../models/customer.otp.model');
const { Otp } = require('../config/customer.OTP');
const bcrypt = require('bcrypt');
const { start } = require('pm2');

const createSCV = async (scvBody) => {
  return SCVPurchase.create(scvBody);
};

const getSCVById = async (id) => {
  const scv = SCVPurchase.findOne({ active: true });
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV Not Found');
  }
  return scv;
};
const getAllSCV = async () => {
  return SCVPurchase.find();
};

const getScvCartbyId = async (id) => {
  const data = await ScvCart.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Found');
  }
  return data;
};

const updateSCVById = async (scvId, updateBody) => {
  let scv = await getSCVById(scvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV not found');
  }
  scv = await SCVPurchase.findByIdAndUpdate({ _id: scvId }, updateBody, { new: true });
  return scv;
};

const deleteSCVById = async (scvId) => {
  const scv = await getSCVById(scvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV not found');
  }
  (scv.active = false), (scv.archive = true), await scv.save();
  return scv;
};

// Scv Partner Flow

const AddCart = async (body, userId) => {
  const data = { ...body, ...{ partnerId: userId } };
  let values = await ScvCart.create(data);
  return values;
};

const DisableCart = async (id) => {
  let values = await ScvCart.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Nat Available');
  }
  values = await ScvCart.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  return values;
};

const getScvCarts = async () => {
  let values = await ScvCart.find({ active: true });
  return values;
};

const updateSCVCart = async (id, body) => {
  let values = await ScvCart.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Availbale');
  }
  values = await ScvCart.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

// Manage Scv Flow

const addScv = async (body, userId) => {
  const data = { ...body, ...{ createdBy: userId } };
  let values = await Scv.create(data);
  return values;
};

const updateSCVByPartner = async (id, body) => {
  let values = await Scv.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'scv Not Available');
  }
  values = await Scv.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

const active_Inactive_Scv_ByPartner = async (id, body) => {
  const { type } = body;
  let values = await Scv.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'scv Not Available');
  }
  if (type == 'active') {
    values = await Scv.findByIdAndUpdate({ _id: id }, { active: true }, { new: true });
  } else {
    values = await Scv.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  }
  return values;
};

const getAllScvByPartners = async (userId) => {
  const values = await Scv.find({ createdBy: userId });
  return values;
};

// Cart Allocation Flow

const getcarts_Allocation = async (userId) => {
  const unAllocatedCart = await ScvCart.aggregate([
    {
      $match: {
        active: true,
        partnerId: userId,
        closeStock: { $nin: ['activated'] },
      },
    },
  ]);

  const AllocatedSCV = await ScvCart.aggregate([
    {
      $match: {
        active: true,
        partnerId: userId,
        closeStock: { $in: ['activated'] },
      },
    },

    {
      $lookup: {
        from: 'scvs',
        localField: 'allocatedScv',
        foreignField: '_id',
        as: 'scv',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$scv',
      },
    },
    {
      $project: {
        _id: 1,
        allocationHistory: 1,
        closeStock: 1,
        active: 1,
        vehicleName: 1,
        vehicleNumber: 1,
        cartName: 1,
        cartLocation: 1,
        createdAt: 1,
        image: 1,
        allocatedScv: 1,
        allocatedTime: 1,
        scvName: '$scv.Name',
        scvActive: '$scv.active',
        scvworkingStatus: '$scv.workingStatus',
        scvemail: '$scv.email',
        scvphoneNumber: '$scv.phoneNumber',
        scvaddress: '$address',
        scvpinCode: '$scv.pinCode',
        scvlandMark: '$scv.landMark',
        scvcreatedAt: '$scv.createdAt',
        scvaddreddProof: '$scv.addreddProof',
        scvidProof: '$scv.idProof',
      },
    },
    {
      $match: {
        scvActive: true,
        scvworkingStatus: 'yes',
      },
    },
  ]);

  return { unAllocatedCart: unAllocatedCart, AllocatedSCV: AllocatedSCV };
};

const getAvailable_Scv = async (userId) => {
  const data = await Scv.aggregate([
    {
      $match: {
        createdBy: userId,
        workingStatus: { $in: ['no'] },
      },
    },
  ]);
  return data;
};

const AllocationScv_ToCart = async (body) => {
  const { scvId, cartId, scvName } = body;
  let getScv = await Scv.findById(scvId);
  let getCart = await ScvCart.findById(cartId);
  if (!getScv) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Scv Not Found');
  }
  if (!getCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Found');
  }
  let allocateTime = moment().toDate();
  getCart = await ScvCart.findByIdAndUpdate(
    { _id: cartId },
    {
      closeStock: 'activated',
      allocatedScv: scvId,
      allocatedTime: allocateTime,
    },
    { new: true }
  );
  await Scv.findByIdAndUpdate({ _id: scvId }, { workingStatus: 'yes' }, { new: true });
  await ScvCart.updateOne(
    { _id: cartId },
    { $push: { allocationHistory: { scvId: scvId, scvName: scvName, date: allocateTime } } },
    { new: true }
  );
  return getCart;
};

const SCVAttendance = async (userId) => {
  let values = await Scv.aggregate([
    { $match: { createdBy: userId, active: true } },
    {
      $lookup: {
        from: 'scvcarts',
        localField: '_id',
        foreignField: 'allocatedScv',
        as: 'cart',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$cart',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        workingStatus: 1,
        attendance: 1,
        Name: 1,
        email: 1,
        phoneNumber: 1,
        address: 1,
        pinCode: 1,
        landMark: 1,
        addreddProof: 1,
        idProof: 1,
        createdAt: 1,
        cartName: '$cart.cartName',
        vehicleName: '$cart.vehicleName',
        vehicleNumber: '$cart.vehicleNumber',
      },
    },
  ]);
  return values;
};

// Customer Work Flow

const RegisterScv = async (body) => {
  const { userName, email, mobileNumber } = body;
  const findOnebyNumber = await Customer.findOne({ mobileNumber: mobileNumber });

  if (!findOnebyNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Invalid');
  }
  if (findOnebyNumber.active != true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User was Disabled by Admin');
  }
  return Otp(findOnebyNumber);
};

const create_scv = async (body) => {
  const scvCreate = await Scv.create(body);
  return scvCreate;
};

const Otpverify = async (body) => {
  let findByOTP = await CustomerOTP.findOne({ OTP: body.OTP, active: true });
  if (!findByOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  findByOTP = await CustomerOTP.findByIdAndUpdate({ _id: findByOTP._id }, { active: false }, { new: true });
  return { message: 'OTP Verfication Success...........' };
};

const setPassword = async (body) => {
  let { mobileNumber, Password } = body;
  let findByemail = await Customer.findOne({ mobileNumber: mobileNumber });
  if (!findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Not Registered');
  }
  Password = await bcrypt.hash(Password, 8);
  findByemail = await Customer.findByIdAndUpdate({ _id: findByemail._id }, { password: Password }, { new: true });
  return findByemail;
};

const LoginCustomer = async (body) => {
  const { mobileNumber, password } = body;
  let findByemail = await Customer.findOne({ mobileNumber: mobileNumber });
  if (!findByemail || !(await findByemail.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (findByemail.active == false) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Partner Disabled By Admin');
  }
  return findByemail;
};

const addPartner = async (body) => {
  const createPartner = await Customer.create(body);
  return createPartner;
};

const getPartners = async () => {
  const getAllPartner = await Customer.aggregate([
    {
      $match: { active: true },
    },
    {
      $lookup: {
        from: 'scvs',
        localField: '_id',
        foreignField: 'createdBy',
        pipeline: [{ $match: { active: true } }],
        as: 'scv',
      },
    },
    {
      $project: {
        active: 1,
        userName: 1,
        email: 1,
        mobileNumber: 1,
        address: 1,
        pinCode: 1,
        landMark: 1,
        createdAt: 1,
        updatedAt: 1,
        addressProof: 1,
        idProof: 1,
        password: 1,
        scvCount: { $size: '$scv' },
        scv: '$scv',
      },
    },
  ]);
  return getAllPartner;
};

const updatePartner = async (id, body) => {
  let getExistPartner = await Customer.findById(id);
  if (!getExistPartner) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Partner Not Found');
  }
  getExistPartner = await Customer.findByIdAndUpdate({ _id: id }, body, { new: true });
  return getExistPartner;
};

const enable_disable_partner = async (id, body) => {
  const { status } = body;
  let findpartner = await Customer.findById(id);
  if (!findpartner) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Partner Not Found');
  }
  if (status == 'enable') {
    findpartner = await Customer.findByIdAndUpdate({ _id: id }, { active: true }, { new: true });
  } else {
    findpartner = await Customer.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  }
  return findpartner;
};

const get_Un_Assigned_Scv = async () => {
  let values = await Scv.aggregate([
    {
      $match: {
        createdBy: { $eq: null },
        active: true,
      },
    },
  ]);
  return values;
};

const allocateSCV_To_Partner_ByAdmin = async (body) => {
  let { arr, partnerId } = body;
  arr.forEach(async (e) => {
    await Scv.findByIdAndUpdate({ _id: e }, { createdBy: partnerId }, { new: true });
  });
  return { message: 'Allocated SuccessFully' };
};

const getAllscv_Admin = async () => {
  const scv = await Scv.find();
  return scv;
};

const scv_attendance = async (body) => {
  const { type, scvId } = body;
  let times = moment().toDate();
  let todayDate = moment().format('dd-MM-YYYY');
  if (type == 'IN') {
    let findTodayRecord = await ScvAttendance.findOne({ scvId: scvId, date: todayDate });
    await Scv.findByIdAndUpdate({ _id: scvId }, { attendance: true }, { new: true });
    if (!findTodayRecord) {
      await ScvAttendance.create({ startTime: times, date: todayDate, scvId: scvId, $push: { history: { start: times } } });
    } else {
      await ScvAttendance.findByIdAndUpdate(
        { _id: findTodayRecord._id },
        { startTime: times, $push: { history: { start: times } } },
        { new: true }
      );
    }
  }
  if (type == 'OUT') {
    let findTodayRecord = await ScvAttendance.findOne({ scvId: scvId, date: todayDate });
    let existSecond = findTodayRecord.totalSeconds;
    let startTime = moment(findTodayRecord.startTime);
    let endTime = moment(times);
    const secondsDiff = endTime.diff(startTime, 'seconds');
    let TotalSecond = existSecond + secondsDiff;
    await ScvAttendance.findByIdAndUpdate(
      { _id: findTodayRecord._id },
      { totalSeconds: TotalSecond, $push: { history: { endTime: endTime } } },
      { new: true }
    );
    await Scv.findByIdAndUpdate({ _id: scvId }, { attendance: false }, { new: true });
  }
  return { Message: 'Attendance updated......' };
};

module.exports = {
  createSCV,
  getAllSCV,
  getScvCartbyId,
  getSCVById,
  updateSCVById,
  deleteSCVById,
  AddCart,
  DisableCart,
  getScvCarts,
  updateSCVCart,
  addScv,
  updateSCVByPartner,
  active_Inactive_Scv_ByPartner,
  getAllScvByPartners,
  getcarts_Allocation,
  getAvailable_Scv,
  AllocationScv_ToCart,
  SCVAttendance,
  RegisterScv,
  Otpverify,
  setPassword,
  LoginCustomer,
  addPartner,
  getPartners,
  updatePartner,
  enable_disable_partner,
  create_scv,
  get_Un_Assigned_Scv,
  allocateSCV_To_Partner_ByAdmin,
  getAllscv_Admin,
  scv_attendance,
};
