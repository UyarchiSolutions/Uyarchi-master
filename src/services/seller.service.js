const httpStatus = require('http-status');
const { Seller } = require('../models/seller.models');
const ApiError = require('../utils/ApiError');
const { OTP, sellerOTP } = require('../models/saveOtp.model');
const sentOTP = require('../config/seller.config');
const bcrypt = require('bcryptjs');
const moment = require('moment')
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister } = require('../models/ecomplan.model');
const createSeller = async (req) => {
  let body = req.body;
  let value = await Seller.findOne({ $or: [{ email: body.email }, { mobileNumber: body.mobileNumber }] });

  if (value) {
    if (value.email == body.email) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exit');
    }
    if (value.mobileNumber == body.mobileNumber) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Phone Number Exit');
    }
  }
  else {
    value = await Seller.create({ ...body, ...{ mainSeller: 'admin', sellerType: "MainSeller", sellerRole: "admin" } })
    value.roleNum = [1]
    value.save()
    const otp = await sentOTP(value.mobileNumber, value);
  }
  return value;
};

const verifyOTP = async (req) => {
  let body = req.body;
  const mobileNumber = body.mobileNumber;
  const otp = body.otp;
  let findOTP = await sellerOTP.findOne({
    mobileNumber: mobileNumber,
    OTP: otp,
    // create: { $gte: moment(new Date().getTime() - 15 * 60 * 1000) },
    active: true,
  });

  if (!findOTP) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid OTP');
  }
  if (findOTP.create < moment(new Date().getTime() - 15 * 60 * 1000)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP Expired');
  }
  findOTP.active = false;
  findOTP.save();
  let seller = await Seller.findById(findOTP.userId);
  return seller;
};

const setPassword = async (req) => {
  let body = req.body;
  let sellerId = req.userId;
  //console.log(sellerId)
  let seller = await Seller.findById(sellerId);

  if (!seller) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid User');
  }
  seller.password = body.password;
  seller.registered = true;
  seller.save();
  return delete seller.password;
};


const forgotPass = async (req) => {
  let body = req.body;
  let value = await Seller.findOne({ mobileNumber: body.mobileNumber, registered: true });

  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Registered');
  }

  await sellerOTP.updateMany({ mobileNumber: body.mobileNumber }, { $set: { active: false } });
  const otp = await sentOTP(value.mobileNumber, value);
  return value;
};


const loginseller = async (req) => {
  let body = req.body;
  const { mobile, password } = body;
  let userName = await Seller.findOne({ mobileNumber: mobile });
  if (!userName) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid User');
  }
  if (!userName.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Disabled');
  }
  if (!userName.registered) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller Not Registered');
  }
  if (!(await userName.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid Password");
  }

  return userName;
};

const alreadyUser = async (req) => {
  let body = req.body;
  let value = await Seller.findOne({ mobileNumber: body.mobileNumber });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found ');
  }
  if (value.registered) {
    throw new ApiError(httpStatus.NOT_FOUND, 'already Registered');
  }
  await sellerOTP.updateMany({ mobileNumber: body.mobileNumber, active: true }, { $set: { active: false } });
  const otp = await sentOTP(value.mobileNumber, value);
  return value;
};

const createSubhost = async (req) => {
  let body = req.body;
  let sellerID = req.userId;
  let value = await Seller.findOne({ $or: [{ email: body.email }, { mobileNumber: body.mobileNumber }] });

  if (value) {
    if (value.email == body.email) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exit');
    }
    if (value.mobileNumber == body.mobileNumber) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Phone Number Exit');
    }
  }
  let returnval = await Seller.create({ ...body, ...{ mainSeller: sellerID, sellerType: "sub-host", sellerRole: body.sellerRole } })
  return returnval;
};


const createSubUser = async (req) => {
  let body = req.body;
  let sellerID = req.userId;
  let value = await Seller.findOne({ $or: [{ email: body.email }, { mobileNumber: body.mobileNumber }] });

  if (value) {
    if (value.email == body.email) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exit');
    }
    if (value.mobileNumber == body.mobileNumber) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Phone Number Exit');
    }
  }
  let returnval = await Seller.create({ ...body, ...{ mainSeller: sellerID, sellerType: "sub-user", sellerRole: body.sellerRole } })
  let rolesNumeric = [];
  let roles = { 'admin': 1, "Stock-Manager": 2, "Account-Manager": 3, "Delivery-Excutive": 4, "Loading-Manager": 5, };
  body.sellerRole.forEach(element => {
    rolesNumeric.push(roles[element])
  });
  returnval.roleNum = rolesNumeric;
  returnval.save();
  return returnval;
};

const mydetails = async (req) => {
  let sellerID = req.userId;
  let value = await Seller.findById(sellerID)

  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }
  let mutableQueryResult = value    // _doc property holds the mutable object
  delete mutableQueryResult.password

  return mutableQueryResult;

}

const GetAllSeller = async () => {
  let values = await Seller.find();
  return values;
};

const GetSellerById = async (id) => {
  let values = await Seller.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller Not Found');
  }
  return values;
};

const UpdateSellerById = async (id, body) => {
  let values = await Seller.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller Not Found');
  }
  values = await Seller.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};


const getsubhostAll = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
  let sellerID = req.userId;
  let values = await Seller.aggregate([
    { $match: { $and: [{ mainSeller: { $eq: sellerID } }, { sellerType: { $eq: "sub-host" } }] } },
    {
      $skip: 10 * page
    },
    {
      $limit: 10,
    },
  ])
  let next = await Seller.aggregate([
    { $match: { $and: [{ mainSeller: { $eq: sellerID } }, { sellerType: { $eq: "sub-host" } }] } },
    {
      $skip: 10 * (page + 1)
    },
    {
      $limit: 10,
    },
  ])
  return { values, next: next.length != 0 };

};

const disabled_hosts = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  host.active = !host.active;
  host.save()
  return host;
}

const get_single_host = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  return host;
}

const update_single_host = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  host = await Seller.findByIdAndUpdate({ _id: host._id }, req.body, { new: true })
  return host;
}

const subhost_free_users = async (req) => {
  let streamId = req.query.id

  let hostTime = await Streamrequest.findById(req.query.id);


  let host = await Seller.aggregate([
    { $match: { $and: [{ sellerType: { $eq: "sub-host" } }, { mainSeller: { $eq: req.userId } }, { $or: [{ sellerRole: { $eq: ["chat/stream"] } }, { sellerRole: { $eq: ["stream"] } }] }] } },
    {
      $lookup: {
        from: 'streamrequests',
        let: { hostId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $or: [{ $eq: ["$allot_host_1", "$$hostId"] }, { $eq: ["$allot_host_2", "$$hostId"] }, { $eq: ["$allot_host_3", "$$hostId"] }] },
              $and: [{ status: { $ne: "Completed" } }, { _id: { $ne: streamId } }, { $or: [{ $and: [{ startTime: { $lte: hostTime.startTime } }, { endTime: { $gte: hostTime.startTime } }] }, { $and: [{ startTime: { $lte: hostTime.endTime } }, { endTime: { $gte: hostTime.endTime } }] }] }],
            }
          },
          { $group: { _id: null, count: { $sum: 1 } } }

        ],
        as: 'streamrequests',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequests',
      },
    },
    {
      $addFields: {
        busy: { $ifNull: ['$streamrequests.count', 0] },
      },
    },
    { $match: { busy: { $eq: 0 } } }
  ])

  let chat = await Seller.aggregate([
    { $match: { $and: [{ sellerType: { $eq: "sub-host" } }, { mainSeller: { $eq: req.userId } }, { $or: [{ sellerRole: { $eq: ["chat/stream"] } }, { sellerRole: { $eq: ["chat"] } }] }] } },
    {
      $lookup: {
        from: 'streamrequests',
        let: { hostId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $or: [{ $eq: ["$allot_host_1", "$$hostId"] }, { $eq: ["$allot_host_2", "$$hostId"] }, { $eq: ["$allot_host_3", "$$hostId"] }] },
              $and: [{ status: { $ne: "Completed" } }, { _id: { $ne: streamId } }, { $or: [{ $and: [{ startTime: { $lte: hostTime.startTime } }, { endTime: { $gte: hostTime.startTime } }] }, { $and: [{ startTime: { $lte: hostTime.endTime } }, { endTime: { $gte: hostTime.endTime } }] }] }],
            }
          },
          { $group: { _id: null, count: { $sum: 1 } } }

        ],
        as: 'streamrequests',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequests',
      },
    },
    {
      $addFields: {
        busy: { $ifNull: ['$streamrequests.count', 0] },
      },
    },
    { $match: { busy: { $eq: 0 } } }
  ])
  return { host, chat };

};
const getsubuserAll = async (req) => {

  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
  let sellerID = req.userId;
  let values = await Seller.aggregate([
    { $match: { $and: [{ mainSeller: { $eq: sellerID } }, { sellerType: { $eq: "sub-user" } }] } },
    {
      $skip: 10 * page
    },
    {
      $limit: 10,
    },
  ])
  let next = await Seller.aggregate([
    { $match: { $and: [{ mainSeller: { $eq: sellerID } }, { sellerType: { $eq: "sub-user" } }] } },
    {
      $skip: 10 * (page + 1)
    },
    {
      $limit: 10,
    },
  ])
  return { values, next: next.length != 0 };
};
const disabled_subuser = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  host.active = !host.active;
  host.save()
  return host;
}


const get_single_user = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  return host;
}

const update_single_user = async (req) => {

  let host = await Seller.findById(req.query.id)
  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  if (host.mainSeller != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sellar Not Found');
  }
  host = await Seller.findByIdAndUpdate({ _id: host._id }, req.body, { new: true })
  return host;
}


const change_password = async (req) => {
  let value = await Seller.findById(req.userId);

  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not Fount');

  }

  if (!(await value.isPasswordMatch(req.body.oldpassword))) {
    throw new ApiError(403, "Password Doesn't Match");
  }
  const salt = await bcrypt.genSalt(10);

  let password = await bcrypt.hash(req.body.password, salt);
  value = await Seller.findByIdAndUpdate({ _id: req.userId }, { password: password }, { new: true });

  return value;
}
const update_my_profile = async (req) => {
  let value = await Seller.findById(req.userId);

  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not Fount');
  }
  value = await Seller.findByIdAndUpdate({ _id: req.userId }, req.body, { new: true });

  return value;
}
module.exports = {
  createSeller,
  verifyOTP,
  GetAllSeller,
  loginseller,
  GetSellerById,
  UpdateSellerById,
  setPassword,
  forgotPass,
  alreadyUser,
  createSubhost,
  createSubUser,
  mydetails,
  getsubhostAll,
  getsubuserAll,
  subhost_free_users,
  disabled_hosts,
  disabled_subuser,
  get_single_host,
  update_single_host,
  get_single_user,
  update_single_user,
  change_password,
  update_my_profile
};
