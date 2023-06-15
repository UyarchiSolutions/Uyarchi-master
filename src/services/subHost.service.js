const httpStatus = require('http-status');
const SubHost = require('../models/subHost.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const TextLocal = require('../config/subHost.TextLocal');
const subHostOTP = require('../models/saveSubHostOTP.model');
const bcrypt = require('bcrypt');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister } = require('../models/ecomplan.model');

const createSubHost = async (body, userId) => {
  const data = { ...body, ...{ created: moment(), createdBy: userId } };
  let exist = await SubHost.findOne({ phoneNumber: data.phoneNumber });
  if (exist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number Already Exist');
  }
  const values = await SubHost.create(data);
  return values;
};

const getActiveSubHosts = async (userId) => {
  let values = await SubHost.find({ active: true, createdBy: userId });
  return values;
};

// send OTP For first Time USers

const SendOtp = async (body) => {
  let values = await SubHost.findOne({ phoneNumber: body.phoneNumber });
  //console.log(values);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Invalid');
  }
  return await TextLocal.Otp(body, values);
};

// verify OTP

const verifyOTP = async (body) => {
  let OTP = await subHostOTP.findOne({ OTP: body.OTP, active: true }).sort({ created: -1 });
  if (!OTP) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP Invalid');
  }
  OTP = await subHostOTP.findByIdAndUpdate({ _id: OTP._id }, { active: false }, { new: true });
  return OTP;
};

// set Password For SubHost

const SetPassword = async (number, body) => {
  const { password, confirmPassword } = body;
  let user = await SubHost.findOne({ phoneNumber: number, active: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'User Not Found');
  }
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password Doesn't Match");
  }
  const salt = await bcrypt.genSalt(7);
  let passwor = { password: await bcrypt.hash(password, salt) };
  user = await SubHost.findByIdAndUpdate({ _id: user._id }, { password: passwor.password }, { new: true });
  return user;
};

const login = async (body) => {
  const { phoneNumber, password } = body;
  let user = await SubHost.findOne({ phoneNumber: body.phoneNumber, active: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  } else {
    if (await user.isPasswordMatch(password)) {
      //console.log(password);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password Invalid');
    }
    return user;
  }
};
const get_subhost_tokens = async (req) => {

  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
  // //console.log(req.userId)
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.createdBy } }, { adminApprove: { $eq: "Approved" } }] } },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'streamRequest',
        pipeline: [
          {
            $lookup: {
              from: 'streamposts',
              localField: 'postId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: "$products" },
                {
                  $project: {
                    _id: 1,
                    productTitle: "$products.productTitle",
                    productId: 1,
                    categoryId: 1,
                    quantity: 1,
                    marketPlace: 1,
                    offerPrice: 1,
                    postLiveStreamingPirce: 1,
                    validity: 1,
                    minLots: 1,
                    incrementalLots: 1,
                    suppierId: 1,
                    DateIso: 1,
                    created: 1,
                  }
                }
              ],
              as: 'streamposts',
            },
          },
          { $unwind: "$streamposts" },
          {
            $project: {
              _id: 1,
              productTitle: "$streamposts.productTitle",
              productId: "$streamposts.productId",
              quantity: "$streamposts.quantity",
              marketPlace: "$streamposts.marketPlace",
              offerPrice: "$streamposts.offerPrice",
              postLiveStreamingPirce: "$streamposts.postLiveStreamingPirce",
              validity: "$streamposts.validity",
              minLots: "$streamposts.minLots",
              incrementalLots: "$streamposts.incrementalLots",
            }
          }
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: "$suppliers" },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { status: { $eq: "Registered" } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'streampreregisters',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregisters',
      },
    },
    {
      $addFields: {
        registeredUsers: { $ifNull: ['$streampreregisters.count', 0] },
      },
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { type: "host" } }],
        as: 'temptokens',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$temptokens',
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: "$suppliers.primaryContactName",
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        DateIso: 1,
        created: 1,
        planId: 1,
        streamrequestposts: "$streamrequestposts",
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        temptokensId: "$temptokens.cloud_id"
      }
    },

    { $sort: { DateIso: -1 } },
    // { $skip: 10 * page },
    // { $limit: 10 },
  ])
  return value;

  return { hello: true, createdBy: req.createdBy }

};

const get_subhost_free = async (req) => {
  let streamId = req.query.id

  let hostTime = await Streamrequest.findById(req.query.id);


  let host = await SubHost.aggregate([
    { $match: { $and: [{ createdBy: { $eq: req.userId } }, { $or: [{ role: { $eq: "chat/stream" } }, { role: { $eq: "stream" } }] }] } },
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

  let chat = await SubHost.aggregate([
    { $match: { $and: [{ createdBy: { $eq: req.userId } }, { $or: [{ role: { $eq: "chat/stream" } }, { role: { $eq: "chat" } }] }] } },
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
}

module.exports = {
  createSubHost,
  getActiveSubHosts,
  SendOtp,
  verifyOTP,
  SetPassword,
  login,
  get_subhost_tokens,
  get_subhost_free
};
