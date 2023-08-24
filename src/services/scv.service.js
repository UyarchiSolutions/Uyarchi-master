const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { ScvCart, Scv, Customer, ScvAttendance, CartOTP, AgoraAuthToken } = require('../models/Scv.mode');
const CustomerOTP = require('../models/customer.otp.model');
const { Otp } = require('../config/customer.OTP');
const bcrypt = require('bcrypt');
const { CartOtp } = require('../config/cartOTP');
const agora = require('agora-access-token');

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

const getCartBy_Allocated_Scv = async (id) => {
  const data = await ScvCart.findOne({ allocatedScv: id });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This Scv Not Allocated this cart');
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
  const data = {
    ...body,
    ...{ partnerId: userId, location: { type: 'Point', coordinates: [parseFloat(body.lat), parseFloat(body.long)] } },
  };
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

const getScvCarts = async (userId) => {
  let values = await ScvCart.find({ active: true, partnerId: userId });
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

const cartOn = async (id, body) => {
  let today = moment().format('DD-MM-YYYY');
  let today1 = moment().format('DD/MM/YYYY');

  let value = await ScvCart.findById(id);
  if (!value) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Available');
  }
  let values = await ScvCart.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: 'scvs',
        localField: 'allocatedScv',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'scvattendances',
              localField: '_id',
              foreignField: 'scvId',
              pipeline: [{ $match: { date: today } }],
              as: 'attendance',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$attendance',
            },
          },
        ],
        as: 'scv',
      },
    },
    {
      $unwind: {
        path: '$scv',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        scvAttendance: '$scv.attendance.date',
        cartOnDate: 1,
        scv: '$scv',
      },
    },
  ]);

  let scvAttendance = values[0];
  //console.log(values[0]);

  let scv = await Scv.findById(value.allocatedScv);

  if (scvAttendance.scvAttendance == today && scv.attendance == true) {
    // value = await ScvCart.findByIdAndUpdate({ _id: id }, body, { new: true });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Scv Attendance Not On Today');
  }
  return value;
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
    {
      $lookup: {
        from: 'scvs',
        localField: 'allocatedScv',
        foreignField: '_id',
        pipeline: [{ $match: { attendance: true } }],
        as: 'scv',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$scv',
      },
    },
  ]);

  const getAbsentScvCarts = await ScvCart.aggregate([
    {
      $match: {
        active: true,
        partnerId: userId,
      },
    },
    {
      $lookup: {
        from: 'scvs',
        localField: 'allocatedScv',
        foreignField: '_id',
        pipeline: [{ $match: { attendance: false } }],
        as: 'scv',
      },
    },
    {
      $unwind: '$scv',
    },
  ]);

  const Allocatedscv = await ScvCart.aggregate([
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
        latestUpdateStock: 1,
        cartOnDate: 1,
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
        pipeline: [{ $match: { attendance: true } }],
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
        latestUpdateStock: 1,
        cartOnDate: 1,
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
      },
    },
  ]);

  return {
    unAllocatedCart: unAllocatedCart,
    AllocatedSCV: AllocatedSCV,
    getAbsentScvCarts: getAbsentScvCarts,
    Allocatedscv: Allocatedscv,
  };
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
    // {
    //   $match: { active: true },
    // },
    {
      $lookup: {
        from: 'scvs',
        localField: '_id',
        foreignField: 'createdBy',
        // pipeline: [{ $match: { active: true } }],
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
        _id: { $ne: null },
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
  const { type, scvId, cartId } = body;
  let times = moment().toDate();
  let todayDate = moment().format('DD-MM-YYYY');
  if (type == 'IN') {
    let findTodayRecord = await ScvAttendance.findOne({ scvId: scvId, date: todayDate });
    await Scv.findByIdAndUpdate({ _id: scvId }, { attendance: true }, { new: true });
    if (!findTodayRecord) {
      await ScvAttendance.create({ startTime: times, date: todayDate, scvId: scvId });
      // await ScvAttendance.findByIdAndUpdate({ _id: data._id }, { $push: { history: { start: times } } }, { new: true });
    } else {
      await ScvAttendance.findByIdAndUpdate({ _id: findTodayRecord._id }, { startTime: times }, { new: true });
    }
  }
  if (type == 'OUT') {
    let findTodayRecord = await ScvAttendance.findOne({ scvId: scvId, date: todayDate });
    //console.log(findTodayRecord);
    let existSecond = findTodayRecord == null ? 0 : findTodayRecord.totalSeconds;
    let startTime = moment(findTodayRecord == null ? 0 : findTodayRecord.startTime);
    let endTime = moment(times);
    const secondsDiff = endTime.diff(startTime, 'seconds');
    let TotalSecond = existSecond + secondsDiff;
    if (findTodayRecord != null) {
      await ScvAttendance.findByIdAndUpdate(
        { _id: findTodayRecord._id },
        { totalSeconds: TotalSecond, $push: { history: { startTime: startTime, endTime: times } } },
        { new: true }
      );
      await Scv.findByIdAndUpdate({ _id: scvId }, { attendance: false }, { new: true });
    } else {
      await Scv.findByIdAndUpdate({ _id: scvId }, { attendance: false }, { new: true });
    }
  }
  return { Message: 'Attendance updated......' };
};

const getScv_Attendance_Reports = async (body) => {
  const { scvId, date } = body;
  let values = await ScvAttendance.aggregate([
    {
      $match: {
        scvId: scvId,
        date: date,
      },
    },
    {
      $lookup: {
        from: 'scvs',
        localField: 'scvId',
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
      $lookup: {
        from: 'scvcarts',
        localField: 'scvId',
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
  ]);
  return values;
};

const Remove__ScvFrom_Cart = async (body) => {
  const { cartId } = body;
  let carts = await ScvCart.findById(cartId);
  if (!carts) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Available');
  }
  await Scv.findByIdAndUpdate({ _id: carts.allocatedScv }, { workingStatus: 'no' }, { new: true });
  carts = await ScvCart.findByIdAndUpdate({ _id: cartId }, { allocatedScv: '', closeStock: 'new' }, { new: true });
  return carts;
};

const getNearByCartBy_CurrrentLocation = async (body) => {
  const { latitude, longitude } = body;
  const date = moment().format('DD/MM/YYYY');
  console.log(date);
  const data = await ScvCart.aggregate([
    {
      $geoNear: {
        includeLocs: 'location',
        near: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        distanceField: 'distance',
        spherical: true,
      },
    },
    {
      $lookup: {
        from: 'partnerorderproducts',
        localField: '_id',
        foreignField: 'cartId',

        pipeline: [
          { $match: { date: date } },
          { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
        ],
        as: 'cartProducts',
      },
    },
    {
      $project: {
        _id: 1,
        vehicleName: 1,
        vehicleNumber: 1,
        cartName: 1,
        cartLocation: 1,
        distance: 1,
        convertedDistance: { $round: [{ $divide: ['$distance', 1000] }, 1] },
        cartProducts: 1,
        count: { $size: '$cartProducts' },
      },
    },
    { $match: { count: { $gt: 0 } } },
  ]);
  return data;
};

const VerifyYourAccount = async (body) => {
  const { mobileNumber } = body;
  let findMobileNumber = await Scv.findOne({ phoneNumber: mobileNumber });
  if (!findMobileNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Not Registered');
  }
  return CartOtp(mobileNumber);
};

const verifyCartOTP = async (body) => {
  const { OTP } = body;
  let findOTP = await CartOTP.findOne({ OTP: OTP, used: false }).sort({ createdAt: -1 });
  if (!findOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
  }
  findOTP = await CartOTP.findOneAndUpdate({ _id: findOTP._id }, { used: true }, { new: true });
  return { message: 'OTP Verification Success' };
};

const setCartPassword = async (body) => {
  const { Password, mobileNumber } = body;
  let finByMobile = await Scv.findOne({ phoneNumber: mobileNumber });
  if (!finByMobile) {
    throw new ApiError('Cannot find Mobile Number');
  }
  const numSaltRounds = 8;
  let hash = (await bcrypt.hash(Password, numSaltRounds)).toString();
  let setPasswordHash = await Scv.findOneAndUpdate({ _id: finByMobile._id }, { password: hash }, { new: true });
  return setPasswordHash;
};

const CartLogin = async (body) => {
  const { mobileNumber, Password } = body;
  let findByMobile = await Scv.findOne({ phoneNumber: mobileNumber });
  if (!findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect Mobile Number');
  }
  let passwordMatch = bcrypt.compare(Password, findByMobile.password);
  return passwordMatch;
};

const findByMobile = async (mobileNumber) => {
  let data = await Scv.findOne({ phoneNumber: mobileNumber });
  return data;
};

// Video Call FLow

const AuthTokenGenerate = async (userId) => {
  let findScv = await Scv.findById(userId);
  if (!findScv) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user');
  }
  let findCartBySCV = await ScvCart.findOne({ allocatedScv: findScv._id });
  if (!findCartBySCV) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart not Available yet');
  }

  const appId = 'ccae3f62564c46809c950dbf4f8488d0';
  const appCertificate = 'd3b6b55cddc745699cfe335c50bf4df6';
  const channelName = findCartBySCV.cartName;
  const uid = userId;
  const expirationTimeInSeconds = 3600;

  const token = agora.RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    agora.RtcRole.PUBLISHER,
    expirationTimeInSeconds
  );

  let token_creation = await AgoraAuthToken.create({
    scvId: uid,
    cartId: findCartBySCV._id,
    channel: channelName,
    AppId: appId,
    AppCertificates: appCertificate,
    Token: token,
  });
  return token_creation;
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
  getScv_Attendance_Reports,
  cartOn,
  getCartBy_Allocated_Scv,
  Remove__ScvFrom_Cart,
  getNearByCartBy_CurrrentLocation,
  VerifyYourAccount,
  verifyCartOTP,
  setCartPassword,
  CartLogin,
  findByMobile,
  AuthTokenGenerate,
};
