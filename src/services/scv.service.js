const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { ScvCart, Scv, Customer } = require('../models/Scv.mode');
const CustomerOTP = require('../models/customer.otp.model');
const { Otp } = require('../config/customer.OTP');
const bcrypt = require('bcrypt');

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

const AddCart = async (body) => {
  let values = await ScvCart.create(body);
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

const addScv = async (body) => {
  let values = await Scv.create(body);
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

const getAllScvByPartners = async () => {
  const values = await Scv.find();
  return values;
};

// Cart Allocation Flow

const getcarts_Allocation = async () => {
  const unAllocatedCart = await ScvCart.aggregate([
    {
      $match: {
        active: true,
        closeStock: { $nin: ['activated'] },
      },
    },
  ]);

  const AllocatedSCV = await ScvCart.aggregate([
    {
      $match: {
        active: true,
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

const getAvailable_Scv = async () => {
  const data = await Scv.aggregate([
    {
      $match: {
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

const SCVAttendance = async () => {
  let values = await Scv.aggregate([
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
  const data = await Customer.create(body);
  return Otp(data);
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
  return findByemail;
};

const addPartner = async (body) => {
  const createPartner = await Customer.create(body);
  return createPartner;
};

const getPartners = async () => {
  const getAllPartner = await Customer.find();
  return getAllPartner;
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
  getPartners
};
