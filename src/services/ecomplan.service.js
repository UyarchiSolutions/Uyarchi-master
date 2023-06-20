const httpStatus = require('http-status');
const {
  Streamplan,
  StreamPost,
  Streamrequest,
  StreamrequestPost,
  StreamPreRegister,
  streamPlanlink,
  Slab,
  shopNotification,
} = require('../models/ecomplan.model');
const axios = require('axios'); //
const { streamingOrder, streamingorderProduct, streamingorderPayments } = require('../models/liveStreaming/checkout.model');
const { Joinusers } = require('../models/liveStreaming/generateToken.model');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk');
const Dates = require('./Date.serive');
const { purchasePlan } = require('../models/purchasePlan.model');
const { tempTokenModel } = require('../models/liveStreaming/generateToken.model');
const generateLink = require('./liveStreaming/generatelink.service');
const moment = require('moment');
const { findById } = require('../models/token.model');

const create_Plans = async (req) => {
  //console.log(req.body);
  const value = await Streamplan.create({ ...req.body, ...{ planType: 'normal' } });
  await Dates.create_date(value);
  //console.log(value);
  return value;
};
const create_Plans_addon = async (req) => {
  const value = await Streamplan.create({ ...req.body, ...{ planType: 'addon' } });
  await Dates.create_date(value);
  //console.log(value);
  return value;
};

const get_all_Plans = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Streamplan.aggregate([{ $sort: { DateIso: -1 } }, { $skip: 10 * page }, { $limit: 10 }]);

  return value;
};

const get_all_Plans_pagination = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Streamplan.aggregate([
    {
      $lookup: {
        from: 'purchasedplans',
        localField: '_id',
        foreignField: 'planId',
        pipeline: [{ $group: { _id: null, count: { $sum: 1 } } }],
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        no_of_person_used: { $ifNull: ['$purchasedplans.count', 0] },
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamplan.aggregate([{ $sort: { DateIso: -1 } }]);

  return { value, next: total.length != 0 };
};

const get_all_Plans_addon = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Streamplan.aggregate([
    { $match: { planType: { $eq: 'addon' } } },
    { $sort: { DateIso: -1 } },
    { $skip: 12 * page },
    { $limit: 12 },
  ]);
  const total = await Streamplan.aggregate([
    { $match: { planType: { $eq: 'addon' } } },
    { $sort: { DateIso: -1 } },
    { $skip: 12 * (page + 1) },
    { $limit: 12 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Plans_normal = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Streamplan.aggregate([
    { $match: { planType: { $ne: 'addon' }, planmode: { $eq: 'Public' } } },
    { $sort: { DateIso: -1 } },
    { $skip: 12 * page },
    { $limit: 12 },
  ]);
  const total = await Streamplan.aggregate([
    { $match: { planType: { $ne: 'addon' }, planmode: { $eq: 'Public' } } },
    { $sort: { DateIso: -1 } },
    { $skip: 12 * (page + 1) },
    { $limit: 12 },
  ]);
  return { value, next: total.length != 0 };
};

const get_one_Plans = async (req) => {
  const value = await Streamplan.findById(req.query.id);
  return value;
};

const update_one_Plans = async (req) => {
  const value = await Streamplan.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true });
  return value;
};

const delete_one_Plans = async (req) => {
  await Streamplan.findByIdAndDelete({ _id: req.query.id });
  return { message: 'deleted' };
};

const create_post = async (req, images) => {
  // //console.log(req.userId, "asdas", { ...req.body, ...{ suppierId: req.userId, images: images } })
  const value = await StreamPost.create({
    ...req.body,
    ...{ suppierId: req.userId, images: images, pendingQTY: req.body.quantity },
  });
  await Dates.create_date(value);
  return value;
};
const create_teaser_upload = async (req, images) => {
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });
  let params = {
    Bucket: 'realestatevideoupload',
    Key: req.file.originalname,
    Body: req.file.buffer,
  };
  let stream;
  return new Promise((resolve) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        //console.log(err);
      }
      //console.log(data);
      stream = await StreamPost.findByIdAndUpdate({ _id: req.query.id }, { video: data.Location });
      resolve({ video: 'success', stream });
    });
  });
};
const get_all_Post = async (req) => {
  const value = await StreamPost.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.userId } }, { isUsed: { $eq: false } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        validity: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
      },
    },
    { $sort: { DateIso: -1 } },
  ]);
  return value;
};

const get_all_Post_with_page_live = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    // //console.log(date, dateMatch)
  }
  const value = await StreamPost.aggregate([
    { $sort: { DateIso: 1 } },
    { $match: { $or: [{ $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { tokenGeneration: { $eq: true } },
                      { startTime: { $lte: date_now } },
                      { endTime: { $gte: date_now } },
                    ],
                  },
                },
              ],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
              streamEnd_Time: '$streamrequests.streamEnd_Time',
              postCount: '$streamrequests.postCount',
              tokenGeneration: '$streamrequests.tokenGeneration',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 1,
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        endTime: '$streamrequestposts.endTime',
        // streamrequestposts: "$streamrequestposts",
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
        streamEnd_Time: '$streamrequestposts.streamEnd_Time',
        postCount: '$streamrequestposts.postCount',
        tokenGeneration: '$streamrequestposts.tokenGeneration',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    { $sort: { DateIso: 1 } },
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] } },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $and: [{ startTime: { $lte: date_now } }, { endTime: { $gte: date_now } }] } }],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              streamingTime: '$streamrequests.streamingTime',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Post_with_page_completed = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    // //console.log(date, dateMatch)
  }
  const value = await StreamPost.aggregate([
    { $sort: { DateIso: 1 } },
    {
      $match: {
        $or: [
          { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] },
          { $and: [{ suppierId: { $eq: req.userId } }, { status: { $eq: 'Completed' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $or: [{ endTime: { $lte: date_now } }, { status: { $eq: 'Completed' } }] } }],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              streamingTime: '$streamrequests.streamingTime',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 'Completed',
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    {
      $match: {
        $or: [
          { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] },
          { $and: [{ suppierId: { $eq: req.userId } }, { status: { $eq: 'Completed' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $or: [{ endTime: { $lte: date_now } }, { status: { $eq: 'Completed' } }] } }],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              streamingTime: '$streamrequests.streamingTime',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Post_with_page_exhausted = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    // //console.log(date, dateMatch)
  }
  const value = await StreamPost.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.userId } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.userId } }, { isUsed: { $eq: false } }] } },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Post_with_page_removed = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    // //console.log(date, dateMatch)
  }
  const value = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Removed' } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
              streamEnd_Time: '$streamrequests.streamEnd_Time',
              postCount: '$streamrequests.postCount',
              tokenGeneration: '$streamrequests.tokenGeneration',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts',
      },
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 1,
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        endTime: '$streamrequestposts.endTime',
        // streamrequestposts: "$streamrequestposts",
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
        streamEnd_Time: '$streamrequestposts.streamEnd_Time',
        postCount: '$streamrequestposts.postCount',
        tokenGeneration: '$streamrequestposts.tokenGeneration',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Removed' } }] } },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              streamingTime: '$streamrequests.streamingTime',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Post_with_page_all = async (req, status) => {
  //console.log('asda');
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      //console.log();
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    //console.log(date, dateMatch);
  }
  //console.log(dateMatch);

  const value = await StreamPost.aggregate([
    // {
    //     $addFields: {
    //         date: { $dateToString: { format: "%Y-%m-%d", date: "$DateIso" } }

    //     }
    // },
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
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
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
              streamEnd_Time: '$streamrequests.streamEnd_Time',
              postCount: '$streamrequests.postCount',
              tokenGeneration: '$streamrequests.tokenGeneration',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts',
      },
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 1,
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        endTime: '$streamrequestposts.endTime',
        // streamrequestposts: "$streamrequestposts",
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
        streamEnd_Time: '$streamrequestposts.streamEnd_Time',
        postCount: '$streamrequestposts.postCount',
        tokenGeneration: '$streamrequestposts.tokenGeneration',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  //console.log(10 * (page + 1))
  const total = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }] } },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0, total: total.length };
};

const get_all_Post_with_page = async (req, status) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      //console.log();
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    //console.log(date, dateMatch);
  }
  //console.log(dateMatch);

  const value = await StreamPost.aggregate([
    // {
    //     $addFields: {
    //         date: { $dateToString: { format: "%Y-%m-%d", date: "$DateIso" } }

    //     }
    // },
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: status } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $or: [{ startTime: { $gte: date_now } }] } }],
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
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
              streamEnd_Time: '$streamrequests.streamEnd_Time',
              postCount: '$streamrequests.postCount',
              tokenGeneration: '$streamrequests.tokenGeneration',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts',
      },
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 1,
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        endTime: '$streamrequestposts.endTime',
        // streamrequestposts: "$streamrequestposts",
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
        streamEnd_Time: '$streamrequestposts.streamEnd_Time',
        postCount: '$streamrequestposts.postCount',
        tokenGeneration: '$streamrequestposts.tokenGeneration',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: status } }] } },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_all_Post_with_page_assigned = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = {
        $and: [
          { DateIso: { $gte: new Date(date[0] + ' 0:0:0').getTime() } },
          { DateIso: { $lte: new Date(date[1] + ' 23:59:59').getTime() } },
        ],
      };
    }
    // //console.log(date, dateMatch)
  }
  const value = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $or: [{ tokenGeneration: { $eq: false } }, { startTime: { $gte: date_now } }] } }],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              startTime: '$streamrequests.startTime',
              endTime: '$streamrequests.endTime',
              allot_host_1: '$streamrequests.allot_host_1',
              allot_host_2: '$streamrequests.allot_host_2',
              allot_host_3: '$streamrequests.allot_host_3',
              streamEnd_Time: '$streamrequests.streamEnd_Time',
              postCount: '$streamrequests.postCount',
              tokenGeneration: '$streamrequests.tokenGeneration',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    {
      $project: {
        productId: 1,
        categoryId: 1,
        quantity: 1,
        marketPlace: 1,
        offerPrice: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        _id: 1,
        catName: '$categories.categoryName',
        productName: '$productName.productTitle',
        created: 1,
        DateIso: 1,
        images: 1,
        video: 1,
        location: 1,
        discription: 1,
        bookingAmount: 1,
        afterStreaming: 1,
        status: 1,
        streamStart: 1,
        streamEnd: 1,
        streamName: '$streamrequestposts.streamName',
        streamingDate: '$streamrequestposts.streamingDate',
        streamingTime: '$streamrequestposts.streamingTime',
        endTime: '$streamrequestposts.endTime',
        // streamrequestposts: "$streamrequestposts",
        startTime: '$streamrequestposts.startTime',
        endTime: '$streamrequestposts.endTime',
        allot_host_1: '$streamrequestposts.allot_host_1',
        allot_host_2: '$streamrequestposts.allot_host_2',
        allot_host_3: '$streamrequestposts.allot_host_3',
        streamEnd_Time: '$streamrequestposts.streamEnd_Time',
        postCount: '$streamrequestposts.postCount',
        tokenGeneration: '$streamrequestposts.tokenGeneration',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await StreamPost.aggregate([
    { $match: { $and: [dateMatch, { suppierId: { $eq: req.userId } }, { status: { $eq: 'Assigned' } }] } },
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              pipeline: [{ $match: { $or: [{ startTime: { $gte: date_now } }] } }],
              as: 'streamrequests',
            },
          },
          {
            $unwind: '$streamrequests',
          },
          {
            $project: {
              _id: 1,
              streamName: '$streamrequests.streamName',
              streamingDate: '$streamrequests.streamingDate',
              streamingTime: '$streamrequests.streamingTime',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $unwind: '$streamrequestposts',
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_one_Post = async (req) => {
  const value = await StreamPost.findById(req.query.id);
  if (value.suppierId != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return value;
};

const update_one_Post = async (req, images) => {
  const value = await StreamPost.findByIdAndUpdate({ _id: req.query.id, suppierId: req.userId }, req.body, { new: true });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  if (images.length != 0) {
    value.images = images;
    value.save();
  }
  return value;
};
const delete_one_Post = async (req) => {
  const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return { message: 'deleted' };
};
const remove_one_post = async (req) => {
  const value = await StreamPost.findByIdAndUpdate(
    { _id: req.query.id, suppierId: req.userId },
    { status: 'Removed' },
    { new: true }
  );
  return { message: 'Removed' };
};

const create_stream_one = async (req) => {
  //console.log(req.body);
  let data = req.body.streamingDate;
  let time = req.body.streamingTime;
  let startTime = new Date(new Date(data + ' ' + time)).getTime();

  const value = await Streamrequest.create({
    ...req.body,
    ...{ suppierId: req.userId, postCount: req.body.post.length, startTime: startTime },
  });
  req.body.post.forEach(async (a) => {
    await StreamPost.findByIdAndUpdate({ _id: a }, { isUsed: true, status: 'Assigned' }, { new: true });
    let post = await StreamrequestPost.create({ suppierId: req.userId, streamRequest: value._id, postId: a });
    await Dates.create_date(post);
  });
  await Dates.create_date(value);
  //step two
  let myplan = await purchasePlan.findById(req.body.planId);
  let plan = await Streamplan.findById(myplan.planId);
  if (myplan.numberOfStreamused + 1 == plan.numberofStream) {
    myplan.active = false;
  }
  myplan.numberOfStreamused = myplan.numberOfStreamused + 1;
  myplan.save();
  let streamss = await Streamrequest.findById(value._id);
  let datess = new Date().setTime(new Date(streamss.startTime).getTime() + plan.Duration * 60 * 1000);
  await Streamrequest.findByIdAndUpdate(
    { _id: value._id },
    {
      Duration: myplan.Duration,
      noOfParticipants: myplan.noOfParticipants,
      chat: myplan.chat,
      max_post_per_stream: myplan.max_post_per_stream,
      sepTwo: 'Completed',
      planId: req.body.planId,
      Duration: plan.Duration,
      endTime: datess,
      streamEnd_Time: datess,
    },
    { new: true }
  );
  return value;
};

const find_and_update_one = async (req) => {
  let data = req.body.streamingDate;
  let time = req.body.streamingTime;
  let startTime = new Date(new Date(data + ' ' + time)).getTime();
  let streamss = await Streamrequest.findById(req.query.id);
  let myplan = await purchasePlan.findById(streamss.planId);
  let plan = await Streamplan.findById(myplan.planId);
  let datess = new Date().setTime(new Date(streamss.startTime).getTime() + plan.Duration * 60 * 1000);

  let value = await Streamrequest.findByIdAndUpdate(
    { _id: req.query.id },
    { ...req.body, ...{ startTime: startTime, endTime: datess, streamEnd_Time: datess } },
    { new: true }
  );
  let posts = value.post;
  //console.log(posts, req.body.addpost);
  req.body.addpost.forEach(async (a) => {
    posts.push(a);
    await StreamPost.findByIdAndUpdate({ _id: a }, { isUsed: true, status: 'Assigned' }, { new: true });
    let post = await StreamrequestPost.create({ suppierId: req.userId, streamRequest: req.query.id, postId: a });
    await Dates.create_date(post);
  });
  value.post = posts;
  value.postCount = posts.length;
  value.save();
  return value;
};

const create_stream_one_image = async (req) => {
  //console.log(req.file, 'asdasda');
  if (req.file != null) {
    await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { image: 'images/stream/' + req.file.filename });
    return { image: 'success' };
  }
  return { image: 'faild' };
};
const create_stream_one_video = async (req) => {
  // //console.log(req.file, "asdasda")
  if (req.file != null) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'realestatevideoupload',
      Key: req.file.originalname,
      Body: req.file.buffer,
    };
    let stream;
    return new Promise((resolve) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          //console.log(err);
        }
        //console.log(data);
        stream = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { teaser: data.Location });
        resolve({ teaser: 'success', stream });
      });
    });
  } else {
    return { message: 'Invalid' };
  }
};
const create_stream_two = async (req) => {
  const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return { message: 'deleted' };
};
const get_all_stream = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  //console.log(req.userId);
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.userId } }] } },
    { $sort: { DateIso: -1 } },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
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
                { $unwind: '$products' },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              images: '$streamposts.images',
              productId: '$streamposts.productId',
              categoryId: '$streamposts.categoryId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              discription: '$streamposts.discription',
              location: '$streamposts.location',
              suppierId: '$streamposts.suppierId',
              DateIso: '$streamposts.DateIso',
              created: '$streamposts.created',
              video: '$streamposts.video',
              productTitle: '$streamposts.products.productTitle',
            },
          },
          // {
          //     $addFields: {
          //         productTitle: '$streamposts.products.productTitle',
          //     },
          // },
        ],
        as: 'streamrequestposts',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    { $match: { $and: [{ suppierId: { $eq: req.userId } }] } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};
const get_one_stream = async (req) => {
  let id = req.query.id;
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: id } }] } },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
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
                {
                  $unwind: '$products',
                },
              ],
              as: 'streamposts',
            },
          },
          {
            $unwind: '$streamposts',
          },
          {
            $project: {
              _id: 1,
              productName: '$streamposts.products.productTitle',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  if (value[0].suppierId != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return value[0];
};

const get_one_stream_assign_host = async (req) => {
  let id = req.query.id;
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ tokenGeneration: { $eq: false } }, { _id: { $eq: id } }] } },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  if (value[0].suppierId != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return value[0];
};

const get_one_stream_step_two = async (req) => {
  //console.log('Asas');
  const value = await Streamrequest.findById(req.query.id);
  const myorders = await purchasePlan.aggregate([
    {
      $match: {
        $and: [{ suppierId: { $eq: req.userId } }, { active: { $eq: true } }],
      },
    },
    {
      $lookup: {
        from: 'streamplans',
        localField: 'planId',
        foreignField: '_id',
        pipeline: [{ $match: { planType: { $ne: 'addon' } } }],
        as: 'streamplans',
      },
    },
    {
      $unwind: '$streamplans',
    },
    {
      $project: {
        _id: 1,
        planName: '$streamplans.planName',
        max_post_per_stream: '$streamplans.max_post_per_stream',
        numberOfParticipants: '$streamplans.numberOfParticipants',
        numberofStream: '$streamplans.numberofStream',
        chatNeed: '$streamplans.chatNeed',
        commision: '$streamplans.commision',
        Duration: '$streamplans.Duration',
        commition_value: '$streamplans.commition_value',
        available: { $gte: ['$streamplans.max_post_per_stream', value.postCount] },
        numberOfStreamused: 1,
      },
    },
  ]);
  if (value.suppierId != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return { value, myorders };
};
const update_one_stream = async (req) => {
  const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return { message: 'deleted' };
};
const update_one_stream_one = async (req) => {
  // let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { sepTwo: "Completed", planId: req.body.plan_name }, { new: true })
  return value;
};

const update_one_stream_two = async (req) => {
  let myplan = await purchasePlan.findById(req.body.plan_name);
  let plan = await Streamplan.findById(myplan.planId);
  //console.log(myplan.numberOfStreamused);
  if (myplan.numberOfStreamused + 1 == plan.numberofStream) {
    myplan.active = false;
  }
  myplan.numberOfStreamused = myplan.numberOfStreamused + 1;
  myplan.save();
  let streamss = await Streamrequest.findById(req.query.id);
  let datess = new Date().setTime(new Date(streamss.startTime).getTime() + plan.Duration * 60 * 1000);
  let value = await Streamrequest.findByIdAndUpdate(
    { _id: req.query.id },
    {
      Duration: myplan.Duration,
      noOfParticipants: myplan.noOfParticipants,
      chat: myplan.chat,
      max_post_per_stream: myplan.max_post_per_stream,
      sepTwo: 'Completed',
      planId: req.body.plan_name,
      Duration: plan.Duration,
      endTime: datess,
    },
    { new: true }
  );
  return value;
};
const delete_one_stream = async (req) => {
  const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return { message: 'deleted' };
};

const get_all_admin = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Streamrequest.aggregate([
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'sellers',
      },
    },
    { $unwind: '$sellers' },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
      },
    },

    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  return value;
};

const update_approved = async (req) => {
  let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { adminApprove: 'Approved' }, { new: true });
  return value;
};

const update_reject = async (req) => {
  let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { adminApprove: 'Rejected' }, { new: true });
  return value;
};

const allot_stream_subhost = async (req) => {
  let value = await Streamrequest.findById(req.query.id);
  if (value.tokenGeneration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  } else {
    value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true });
  }
  return value;
};

const cancel_stream = async (req) => {
  let value = await Streamrequest.findByIdAndUpdate({ _id: req.body.id }, { status: 'Cancelled' }, { new: true });
  let assginStream = await StreamrequestPost.find({ streamRequest: req.body.id });
  assginStream.forEach(async (a) => {
    await StreamPost.findByIdAndUpdate({ _id: a.postId }, { status: 'Cancelled' }, { new: true });
  });
  return value;
};
const appID = '1ba2592b16b74f3497e232e1b01f66b0';
const appCertificate = '8ae85f97802448c2a47b98715ff90ffb';
const Authorization = `Basic ${Buffer.from(`61b817e750214d58ba9d8148e7c89a1b:88401de254b2436a9da15b2f872937de`).toString(
  'base64'
)}`;
const end_stream = async (req) => {
  let value = await Streamrequest.findByIdAndUpdate(
    { _id: req.query.id },
    { status: 'Completed', streamEnd_Time: moment(), end_Status: 'HostLeave' },
    { new: true }
  );
  req.io.emit(req.query.id + '_stream_end', { value: true });
  let assginStream = await StreamrequestPost.find({ streamRequest: req.query.id });
  assginStream.forEach(async (a) => {
    await StreamPost.findByIdAndUpdate({ _id: a.postId }, { status: 'Completed' }, { new: true });
  });
  const mode = 'mix';
  // value = await tempTokenModel.findOne({ chennel: streamId, type: 'CloudRecording', recoredStart: { $ne: "stop" } });
  let token = await tempTokenModel.findOne({ chennel: req.query.id, type: 'CloudRecording', recoredStart: { $ne: 'stop' } });
  if (token != null) {
    token.recoredStart = 'stop';
    token.save();
    const resource = token.resourceId;
    const sid = token.sid;
    const stop = await axios.post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
      {
        cname: token.chennel,
        uid: token.Uid.toString(),
        clientRequest: {},
      },
      {
        headers: {
          Authorization,
        },
      }
    );
  }
  return { value: true };
};

const get_all_streams = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  //console.log(req.userId);
  var date_now = new Date().getTime();
  let statusFilter = { active: true };
  if (req.query.status == 'All') {
    statusFilter = { active: true };
  }

  if (req.query.status == 'Completed') {
    statusFilter = {
      $and: [
        { stream_expired: { $eq: false } },
        {
          $or: [
            { status: { $eq: 'Completed' } },
            {
              $and: [{ tokenGeneration: { $eq: true } }, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }],
            },
          ],
        },
      ],
    };
  }
  if (req.query.status == 'Cancelled') {
    statusFilter = { status: { $eq: 'Cancelled' } };
  }
  if (req.query.status == 'Waiting') {
    statusFilter = {
      $and: [{ tokenGeneration: { $eq: false } }, { startTime: { $gte: date_now } }, { status: { $ne: 'Cancelled' } }],
    };
  }

  var date_now_string = new Date();
  if (req.query.status == 'Expired') {
    statusFilter = {
      $and: [
        { tokenGeneration: { $eq: true } },
        { originalDate: { $lte: date_now_string } },
        { status: { $ne: 'Cancelled' } },
      ],
    };
  }

  const value = await Streamrequest.aggregate([
    {
      $addFields: {
        originalDate: {
          $add: [{ $toDate: '$startTime' }, { $multiply: [30, 24, 60, 60, 1000] }],
        },
      },
    },
    {
      $addFields: {
        stream_expired: { $lte: ['$originalDate', date_now_string] },
      },
    },
    { $match: { $and: [statusFilter, { suppierId: { $eq: req.userId } }, { adminApprove: { $eq: 'Approved' } }] } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },

    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', '$allot_chat'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', '$allot_host_1'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', '$allot_host_2'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', '$allot_host_3'] },
      },
    },

    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        hostingPermissions: {
          $or: [
            { $eq: ['$allot_host_1', 'my self'] },
            { $eq: ['$allot_host_2', 'my self'] },
            { $eq: ['$allot_host_3', 'my self'] },
          ],
        },
        no_of_host: '$purchasedplans.no_of_host',
        chat_need: 1,
        allot_chat: 1,
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        teaser: 1,
        image: 1,
        video: 1,
        chat: 1,
        chat_need: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        primarycommunication: 1,
        secondarycommunication: 1,
        originalDate: 1,
        stream_expired: 1,
      },
    },

    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    {
      $addFields: {
        originalDate: {
          $add: [{ $toDate: '$startTime' }, { $multiply: [30, 24, 60, 60, 1000] }],
        },
      },
    },
    {
      $addFields: {
        stream_expired: { $lte: ['$originalDate', date_now_string] },
      },
    },
    { $match: { $and: [statusFilter, { suppierId: { $eq: req.userId } }, { adminApprove: { $eq: 'Approved' } }] } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const get_subhost_streams = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  //console.log(req.query, page);

  var date_now = new Date().getTime();
  let statusFilter = { active: true };
  if (req.query.status == 'All') {
    statusFilter = { active: true };
  }

  if (req.query.status == 'Completed') {
    statusFilter = {
      $and: [
        { stream_expired: { $eq: false } },
        {
          $or: [
            { status: { $eq: 'Completed' } },
            {
              $and: [{ tokenGeneration: { $eq: true } }, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }],
            },
          ],
        },
      ],
    };
  }
  if (req.query.status == 'Cancelled') {
    statusFilter = { status: { $eq: 'Cancelled' } };
  }
  if (req.query.status == 'Waiting') {
    statusFilter = {
      $and: [{ tokenGeneration: { $eq: false } }, { startTime: { $gte: date_now } }, { status: { $ne: 'Cancelled' } }],
    };
  }

  var date_now_string = new Date();
  if (req.query.status == 'Expired') {
    statusFilter = {
      $and: [
        { tokenGeneration: { $eq: true } },
        { originalDate: { $lte: date_now_string } },
        { status: { $ne: 'Cancelled' } },
      ],
    };
  }
  //console.log("asdhagfsdyahgsv", statusFilter)
  const value = await Streamrequest.aggregate([
    {
      $addFields: {
        originalDate: {
          $add: [{ $toDate: '$startTime' }, { $multiply: [30, 24, 60, 60, 1000] }],
        },
      },
    },
    {
      $addFields: {
        stream_expired: { $lte: ['$originalDate', date_now_string] },
      },
    },
    {
      $match: {
        $and: [
          statusFilter,
          {
            $or: [
              { allot_host_1: { $eq: req.userId } },
              { allot_host_2: { $eq: req.userId } },
              { allot_host_3: { $eq: req.userId } },
            ],
          },
          { adminApprove: { $eq: 'Approved' } },
        ],
      },
    },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', '$allot_chat'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', '$allot_host_1'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', '$allot_host_2'] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', '$allot_host_3'] },
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        hostingPermissions: {
          $or: [
            { $eq: ['$allot_host_1', 'my self'] },
            { $eq: ['$allot_host_2', 'my self'] },
            { $eq: ['$allot_host_3', 'my self'] },
          ],
        },
        no_of_host: '$purchasedplans.no_of_host',
        chat_need: 1,
        allot_chat: 1,
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        teaser: 1,
        image: 1,
        video: 1,
        chat: 1,
        chat_need: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
      },
    },

    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    {
      $addFields: {
        originalDate: {
          $add: [{ $toDate: '$startTime' }, { $multiply: [30, 24, 60, 60, 1000] }],
        },
      },
    },
    {
      $addFields: {
        stream_expired: { $lte: ['$originalDate', date_now_string] },
      },
    },
    {
      $match: {
        $and: [
          statusFilter,
          {
            $or: [
              { allot_host_1: { $eq: req.userId } },
              { allot_host_2: { $eq: req.userId } },
              { allot_host_3: { $eq: req.userId } },
            ],
          },
          { adminApprove: { $eq: 'Approved' } },
        ],
      },
    },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};

const go_live_stream_host = async (req, userId) => {
  let value = await Streamrequest.aggregate([
    {
      $match: {
        $and: [{ suppierId: { $eq: userId } }, { adminApprove: { $eq: 'Approved' } }, { _id: { $eq: req.query.id } }],
      },
    },
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
                    from: 'streamingcartproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'streamingcarts',
                          localField: 'streamingCart',
                          foreignField: '_id',
                          pipeline: [
                            { $match: { $and: [{ status: { $ne: 'ordered' } }] } },
                            {
                              $project: {
                                _id: 1,
                              },
                            },
                          ],
                          as: 'streamingcarts',
                        },
                      },
                      { $unwind: '$streamingcarts' },
                      { $match: { $and: [{ cardStatus: { $eq: true } }, { add_to_cart: { $eq: true } }] } },
                      { $group: { _id: null, count: { $sum: '$cartQTY' } } },
                    ],
                    as: 'stream_cart',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_cart',
                  },
                },
                {
                  $lookup: {
                    from: 'streamingorderproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [{ $group: { _id: null, count: { $sum: '$purchase_quantity' } } }],
                    as: 'stream_checkout',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_checkout',
                  },
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },

                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
                    image: '$products.image',
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
                    streamStart: 1,
                    streamEnd: 1,
                    stream_cart: { $ifNull: ['$stream_cart.count', 0] },
                    stream_checkout: { $ifNull: ['$stream_checkout.count', 0] },
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              image: '$streamposts.image',
              streamStart: '$streamposts.streamStart',
              streamEnd: '$streamposts.streamEnd',
              streampostsId: '$streamposts._id',
              stream_cart: '$streamposts.stream_cart',
              stream_checkout: '$streamposts.stream_checkout',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ supplierId: { $eq: userId } }] } }],
        as: 'temptokens',
      },
    },
    { $unwind: '$temptokens' },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { $and: [{ type: { $eq: 'subhost' } }] } },
          {
            $lookup: {
              from: 'sellers',
              localField: 'supplierId',
              foreignField: '_id',
              as: 'subhosts',
            },
          },
          {
            $unwind: '$subhosts',
          },
          {
            $addFields: {
              supplierName: { $ifNull: ['$subhosts.contactName', ''] },
            },
          },
        ],
        as: 'temptokens_sub',
      },
    },
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
              pipeline: [{ $match: { $and: [{ streamStart: { $ne: null } }, { streamEnd: { $eq: null } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
        as: 'streamrequestposts_start',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_start',
      },
    },
    {
      $addFields: {
        streamPending: { $ifNull: ['$streamrequestposts_start.count', false] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        temptokens: '$temptokens',
        Duration: 1,
        startTime: 1,
        endTime: 1,
        streamPending: 1,
        primaryHost: { $eq: ['$allot_host_1', 'my self'] },
        chatPermistion: { $eq: ['$allot_chat', 'my self'] },
        chat_need: 1,
        temptokens_sub: '$temptokens_sub',
        no_of_host: '$purchasedplans.no_of_host',
      },
    },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }
  return value[0];
};

const get_subhost_token = async (req, userId) => {
  let value = await Streamrequest.aggregate([
    {
      $match: {
        $and: [
          { $or: [{ allot_host_1: { $eq: userId } }, { allot_host_2: { $eq: userId } }, { allot_host_3: { $eq: userId } }] },
          { adminApprove: { $eq: 'Approved' } },
          { _id: { $eq: req.query.id } },
        ],
      },
    },
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
                    from: 'streamingcartproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'streamingcarts',
                          localField: 'streamingCart',
                          foreignField: '_id',
                          pipeline: [
                            { $match: { $and: [{ status: { $ne: 'ordered' } }] } },
                            {
                              $project: {
                                _id: 1,
                              },
                            },
                          ],
                          as: 'streamingcarts',
                        },
                      },
                      { $unwind: '$streamingcarts' },
                      { $match: { $and: [{ cardStatus: { $eq: true } }, { add_to_cart: { $eq: true } }] } },
                      { $group: { _id: null, count: { $sum: '$cartQTY' } } },
                    ],
                    as: 'stream_cart',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_cart',
                  },
                },
                {
                  $lookup: {
                    from: 'streamingorderproducts',
                    localField: '_id',
                    foreignField: 'streamPostId',
                    pipeline: [{ $group: { _id: null, count: { $sum: '$purchase_quantity' } } }],
                    as: 'stream_checkout',
                  },
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$stream_checkout',
                  },
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },

                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
                    image: '$products.image',
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
                    streamStart: 1,
                    streamEnd: 1,
                    stream_cart: { $ifNull: ['$stream_cart.count', 0] },
                    stream_checkout: { $ifNull: ['$stream_checkout.count', 0] },
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              image: '$streamposts.image',
              streamStart: '$streamposts.streamStart',
              streamEnd: '$streamposts.streamEnd',
              streampostsId: '$streamposts._id',
              stream_cart: '$streamposts.stream_cart',
              stream_checkout: '$streamposts.stream_checkout',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ supplierId: { $eq: userId } }] } }],
        as: 'temptokens',
      },
    },
    { $unwind: '$temptokens' },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          {
            $match: {
              $or: [
                { $and: [{ type: { $eq: 'subhost' } }, { supplierId: { $ne: userId } }] },
                { type: { $eq: 'Supplier' } },
              ],
            },
          },
          {
            $lookup: {
              from: 'sellers',
              localField: 'supplierId',
              foreignField: '_id',
              as: 'subhosts',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$subhosts',
            },
          },
          {
            $lookup: {
              from: 'sellers',
              localField: 'supplierId',
              foreignField: '_id',
              as: 'suppliers',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$suppliers',
            },
          },
          {
            $addFields: {
              supplierName: { $ifNull: ['$suppliers.contactName', '$subhosts.contactName'] },
            },
          },
        ],
        as: 'temptokens_sub',
      },
    },
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
              pipeline: [{ $match: { $and: [{ streamStart: { $ne: null } }, { streamEnd: { $eq: null } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
        as: 'streamrequestposts_start',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_start',
      },
    },
    {
      $addFields: {
        streamPending: { $ifNull: ['$streamrequestposts_start.count', false] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        temptokens: '$temptokens',
        Duration: 1,
        startTime: 1,
        endTime: 1,
        streamPending: 1,
        primaryHost: { $eq: ['$allot_host_1', userId] },
        chatPermistion: { $eq: ['$allot_chat', userId] },
        chat_need: 1,
        temptokens_sub: '$temptokens_sub',
        no_of_host: '$purchasedplans.no_of_host',
      },
    },
  ]);
  return value;
};

const go_live_stream_host_SUBHOST = async (req, userId) => {
  let value = await tempTokenModel.findById(req.query.id);
  return value;
};
const get_watch_live_steams_admin_watch = async (req) => {
  var date_now = new Date().getTime();
  let value = await Streamrequest.aggregate([
    { $match: { $and: [{ adminApprove: { $eq: 'Approved' } }, { endTime: { $gt: date_now } }] } },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'CloudRecording' } }] } }],
        as: 'temptokens',
      },
    },
    {
      $unwind: '$temptokens',
    },
  ]);
  return value;
};

const get_watch_live_steams_upcoming_byid = async (req) => {
  var date_now = new Date().getTime();
  let registeredFilter = { registerStatus: { $in: ['Not Registered', 'Unregistered', 'Registered'] } };
  let statusFilter = { startTime: { $gt: date_now } };
  let streamId = req.query.id;
  let value = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    { $match: { $and: [{ _id: { $eq: streamId } }, { adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: '$suppliers',
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [registeredFilter] } },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              DateIso: '$streamposts.DateIso',
              active: '$streamposts.active',
              afterStreaming: '$streamposts.afterStreaming',
              archive: '$streamposts.archive',
              bookingAmount: '$streamposts.bookingAmount',
              categoryId: '$streamposts.categoryId',
              created: '$streamposts.created',
              discription: '$streamposts.discription',
              images: '$streamposts.images',
              incrementalLots: '$streamposts.incrementalLots',
              isUsed: '$streamposts.isUsed',
              location: '$streamposts.location',
              marketPlace: '$streamposts.marketPlace',
              minLots: '$streamposts.minLots',
              newVideoUpload: '$streamposts.newVideoUpload',
              offerPrice: '$streamposts.offerPrice',
              orderedQTY: '$streamposts.orderedQTY',
              pendingQTY: '$streamposts.pendingQTY',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              productId: '$streamposts.productId',
              productTitle: '$streamposts.productTitle',
              quantity: '$streamposts.quantity',
              status: '$streamposts.status',
              suppierId: '$streamposts.suppierId',
              video: '$streamposts.video',
              postId: '$streamposts._id',
              // streamposts:"$streamposts",
              _id: 1,
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    // { $unwind: "$streamrequestposts" },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        tradeName: '$suppliers.tradeName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        streamrequestposts: '$streamrequestposts',
        image: 1,
        teaser: 1,
        primarycommunication: 1,
        secondarycommunication: 1,
      },
    },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }
  return value[0];
};

const get_watch_live_steams_current = async (req) => {
  var date_now = new Date().getTime();
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let currentLives = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { startTime: { $lt: date_now } },
          { streamEnd_Time: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { startTime: { $lt: date_now } },
          { streamEnd_Time: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                { $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value: currentLives, next: total.length != 0 };
};

const get_watch_live_steams_upcoming = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let registeredFilter = { registerStatus: { $in: ['Not Registered', 'Unregistered'] } };
  let statusFilter = { startTime: { $gt: date_now } };

  let value = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    { $match: { $and: [statusFilter, { adminApprove: { $eq: 'Approved' } }, { status: { $ne: 'Cancelled' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [registeredFilter] } },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Streamrequest.aggregate([
    { $match: { $and: [statusFilter, { adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};
const get_watch_live_steams_interested = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let registeredFilter = { registerStatus: { $eq: 'Registered' } };
  let value = await Streamrequest.aggregate([
    { $match: { $and: [{ adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: '$streampreregister',
    },
    {
      $addFields: {
        registerStatus: '$streampreregister.status',
      },
    },
    {
      $addFields: {
        eligible: '$streampreregister.eligible',
      },
    },
    {
      $addFields: {
        viewstatus: '$streampreregister.viewstatus',
      },
    },
    {
      $addFields: {
        reg_DateIso: '$streampreregister.DateIso',
      },
    },
    { $sort: { reg_DateIso: -1 } },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },

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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        tradeName: '$suppliers.tradeName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Streamrequest.aggregate([
    { $match: { $and: [{ adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, next: total.length != 0 };
};
const get_watch_live_steams_completed = async (req) => {
  var date_now = new Date().getTime();
  let statusFilter = {
    $or: [
      { status: { $eq: 'Completed' } },
      { $and: [{ streamEnd_Time: { $lt: date_now } }, { tokenGeneration: { $eq: true } }] },
    ],
  };
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let completedHide = { streamrequestposts_count: { $ne: 0 } };
  let registeredFilter = { registerStatus: { $in: ['Not Registered', 'Unregistered'] } };
  let value = await Streamrequest.aggregate([
    { $sort: { startTime: -1 } },
    { $match: { $and: [statusFilter, { adminApprove: { $eq: 'Approved' } }, { status: { $ne: 'Cancelled' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }, { status: { $ne: 'Removed' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },
    { $match: { $and: [completedHide] } },
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
                { $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    { $match: { $and: [statusFilter, { adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },
    { $match: { $and: [completedHide] } },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { value, total: total.length };
};

const get_watch_live_steams = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let statusFilter = { active: false };
  let status = req.query.status;
  var date_now = new Date().getTime();
  let type = req.query.type;
  let registeredFilter = { registerStatus: { $in: ['Not Registered', 'Unregistered'] } };
  let completedHide = { active: true };
  if (status == 'upcoming') {
    statusFilter = { startTime: { $gt: date_now } };
  }
  if (status == 'live') {
    statusFilter = {
      $and: [{ status: { $ne: 'Completed' } }, { startTime: { $lt: date_now } }, { streamEnd_Time: { $gt: date_now } }],
    };
  }
  if (status == 'completed') {
    var today = new Date();
    var date_now_com = new Date(new Date().setDate(today.getDate() + 30)).getTime();
    statusFilter = {
      $or: [
        { status: { $eq: 'Completed' } },
        { $and: [{ streamEnd_Time: { $lt: date_now } }, { tokenGeneration: { $eq: true } }] },
      ],
    };
    completedHide = { streamrequestposts_count: { $ne: 0 } };
  }
  if (type == 'registered') {
    registeredFilter = { registerStatus: { $eq: 'Registered' } };
  }
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
  }
  let value = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    { $match: { $and: [statusFilter, dateMatch, { adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },
    { $match: { $and: [completedHide] } },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
    {
      $group: {
        _id: { date: '$streamingDate' },
        list: { $push: '$$ROOT' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        list: 1,
      },
    },
    { $sort: { date: -1 } },
  ]);
  let total = await Streamrequest.aggregate([
    { $match: { $and: [statusFilter, dateMatch, { adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [registeredFilter] } },
  ]);
  return { value, total: total.length };
};

const get_watch_live_token = async (req) => {
  let value = await Streamrequest.aggregate([{ $match: { $and: [{ adminApprove: { $eq: 'Approved' } }] } }]);
  return value;
};

const on_going_stream = async (req) => {
  var date_now = new Date().getTime();
  let userjoin = await Joinusers.findById(req.query.id);
  let streamId = userjoin.streamId;

  let statusFilter = {
    $or: [
      { status: { $eq: 'Completed' } },
      { $and: [{ streamEnd_Time: { $lt: date_now } }, { tokenGeneration: { $eq: true } }] },
    ],
  };
  let completedStream = await Streamrequest.aggregate([
    {
      $match: {
        $and: [
          { _id: { $ne: streamId } },
          statusFilter,
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: '$streampreregister',
    },
    {
      $addFields: {
        registerStatus: '$streampreregister.status',
      },
    },
    {
      $addFields: {
        eligible: '$streampreregister.eligible',
      },
    },
    {
      $addFields: {
        viewstatus: '$streampreregister.viewstatus',
      },
    },
    {
      $addFields: {
        reg_DateIso: '$streampreregister.DateIso',
      },
    },
    { $sort: { reg_DateIso: -1 } },
    { $match: { $and: [{ registerStatus: { $eq: 'Registered' } }] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },

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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        tradeName: '$suppliers.tradeName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        teaser: 1,
      },
    },
    { $limit: 5 },
  ]);

  let upcoming = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { _id: { $ne: streamId } },
          { startTime: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        teaser: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $limit: 5 },
  ]);
  let currentLives = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { _id: { $ne: streamId } },
          { startTime: { $lt: date_now } },
          { streamEnd_Time: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        image: 1,
        teaser: 1,
        productArray: '$streamrequestposts.productTitle',
      },
    },
    { $limit: 5 },
  ]);
  return { completedStream, currentLives, upcoming };
};

const getall_homeage_streams = async (req) => {
  let interested = await Streamrequest.aggregate([
    { $match: { $and: [{ adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: '$streampreregister',
    },
    {
      $addFields: {
        registerStatus: '$streampreregister.status',
      },
    },
    {
      $addFields: {
        eligible: '$streampreregister.eligible',
      },
    },
    {
      $addFields: {
        viewstatus: '$streampreregister.viewstatus',
      },
    },
    {
      $addFields: {
        reg_DateIso: '$streampreregister.DateIso',
      },
    },
    { $sort: { reg_DateIso: -1 } },
    { $match: { $and: [{ registerStatus: { $eq: 'Registered' } }] } },
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
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },

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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        tradeName: '$suppliers.tradeName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        teaser: 1,
      },
    },
    { $limit: 5 },
  ]);
  let interested_next = await Streamrequest.aggregate([
    { $match: { $and: [{ adminApprove: { $eq: 'Approved' } }] } },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: '$streampreregister',
    },
    {
      $addFields: {
        registerStatus: '$streampreregister.status',
      },
    },
    {
      $addFields: {
        eligible: '$streampreregister.eligible',
      },
    },
    {
      $addFields: {
        viewstatus: '$streampreregister.viewstatus',
      },
    },
    {
      $addFields: {
        reg_DateIso: '$streampreregister.DateIso',
      },
    },
    { $sort: { reg_DateIso: -1 } },
    { $match: { $and: [{ registerStatus: { $eq: 'Registered' } }] } },
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
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },
    {
      $addFields: {
        streamrequestposts_count: { $ifNull: ['$streamrequestposts_count.count', 0] },
      },
    },

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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        tradeName: '$suppliers.tradeName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        teaser: 1,
      },
    },
    { $skip: 5 },
    { $limit: 5 },
  ]);

  var date_now = new Date().getTime();
  let upcoming = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [{ startTime: { $gt: date_now } }, { adminApprove: { $eq: 'Approved' } }, { status: { $ne: 'Cancelled' } }],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        teaser: 1,
      },
    },
    { $limit: 5 },
  ]);
  let upcoming_next = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [{ startTime: { $gt: date_now } }, { adminApprove: { $eq: 'Approved' } }, { status: { $ne: 'Cancelled' } }],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        image: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.primaryContactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        teaser: 1,
      },
    },
    { $skip: 5 },
    { $limit: 5 },
  ]);
  let currentLives = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { startTime: { $lt: date_now } },
          { streamEnd_Time: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                // { $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        // streamrequestposts:"$streamrequestposts",
        image: 1,
        teaser: 1,
      },
    },
    { $limit: 5 },
  ]);
  let currentLives_next = await Streamrequest.aggregate([
    { $sort: { startTime: 1 } },
    {
      $match: {
        $and: [
          { startTime: { $lt: date_now } },
          { streamEnd_Time: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $group: { _id: 1, count: { $sum: 1 } } }],
        as: 'joinedusers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers',
      },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { shopId: req.shopId } },
          {
            $project: {
              _id: 1,
              active: { $eq: ['$shopId', req.shopId] },
            },
          },
        ],
        as: 'joinedusers_user',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$joinedusers_user',
      },
    },
    {
      $addFields: {
        alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { shopId: req.shopId } }],
        as: 'streampreregister',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streampreregister',
      },
    },
    {
      $addFields: {
        registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
      },
    },
    {
      $addFields: {
        eligible: { $ifNull: ['$streampreregister.eligible', false] },
      },
    },
    {
      $addFields: {
        viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
      },
    },
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
              pipeline: [{ $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } }],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'streamrequestposts_count',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamrequestposts_count',
      },
    },

    { $match: { $and: [{ registerStatus: { $in: ['Not Registered', 'Unregistered'] } }] } },
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
                // { $match: { $and: [{ afterStreaming: { $eq: 'yes' } }] } },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: '$products' },
                {
                  $addFields: {
                    productTitle: '$products.productTitle',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    productTitle: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },

          {
            $group: {
              _id: null,
              productTitle: { $push: '$streamposts.productTitle' },
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        post: 1,
        communicationMode: 1,
        sepTwo: 1,
        adminApprove: 1,
        activelive: 1,
        tokenGeneration: 1,
        bookingAmount: 1,
        streamingDate: 1,
        streamingTime: 1,
        discription: 1,
        streamName: 1,
        suppierId: 1,
        postCount: 1,
        startTime: 1,
        DateIso: 1,
        created: 1,
        Duration: 1,
        chat: 1,
        endTime: 1,
        max_post_per_stream: 1,
        noOfParticipants: 1,
        planId: 1,
        tokenDetails: 1,
        golive: { $gt: ['$noOfParticipants', '$joinedusers.count'] },
        goLive: 1,
        joinedusers_user: '$joinedusers_user',
        alreadyJoined: 1,
        suppliersName: '$suppliers.contactName',
        registerStatus: 1,
        eligible: 1,
        viewstatus: 1,
        status: 1,
        streamrequestposts_count: 1,
        streamEnd_Time: 1,
        productArray: '$streamrequestposts.productTitle',
        // streamrequestposts:"$streamrequestposts",
        image: 1,
        teaser: 1,
      },
    },
    { $skip: 5 },
    { $limit: 5 },
  ]);
  return {
    interested,
    currentLives,
    upcoming,
    interested_next: interested_next.length != 0,
    currentLives_next: currentLives_next.length != 0,
    upcoming_next: upcoming_next.length != 0,
  };
};

const regisetr_strean_instrest = async (req) => {
  let findresult = await StreamPreRegister.findOne({ shopId: req.shopId, streamId: req.body.streamId });
  let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: 'Registered' }).count();
  let participents = await Streamrequest.findById(req.body.streamId);
  // //console.log(count, 231231, participents.noOfParticipants > count, participents.noOfParticipants)
  if (!findresult) {
    findresult = await StreamPreRegister.create({
      shopId: req.shopId,
      streamId: req.body.streamId,
      streamCount: count + 1,
      eligible: participents.noOfParticipants > count,
    });
    findresult.viewstatus =
      participents.noOfParticipants > count
        ? 'Confirmed'
        : participents.noOfParticipants + participents.noOfParticipants / 2 > count
        ? 'RAC'
        : 'Waiting';
    await Dates.create_date(findresult);
  } else {
    if (findresult.status != 'Registered') {
      findresult.streamCount = count + 1;
      findresult.viewstatus =
        participents.noOfParticipants > count
          ? 'Confirmed'
          : participents.noOfParticipants + participents.noOfParticipants / 2 > count
          ? 'RAC'
          : 'Waiting';
      findresult.eligible = participents.noOfParticipants > count;
      findresult.status = 'Registered';
      await Dates.create_date(findresult);
    }
  }

  await single_stream_details(req);

  // let update = await StreamPreRegister.find({ streamId: participents._id, eligible: false }).sort({ DateIso: -1 }).limit(participents.noOfParticipants / 2)
  // //console.log(update)
  // update.forEach(async (e) => {
  //     e.viewstatus = "RAC"
  //     e.save()
  // })

  return { findresult };
};
const unregisetr_strean_instrest = async (req) => {
  let findresult = await StreamPreRegister.findOne({ shopId: req.shopId, streamId: req.body.streamId });
  let user_postion = findresult.streamCount;
  let participents = await Streamrequest.findById(req.body.streamId);
  let noOfParticipants = participents.noOfParticipants;
  findresult.streamCount = 0;
  findresult.eligible = false;
  findresult.viewstatus = '';
  findresult.status = 'Unregistered';
  findresult.save();
  let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: 'Registered' }).count();
  let streamPosition = 0;
  let go_next = false;
  let remaining = noOfParticipants - count;
  if (remaining > 0) {
    //console.log(remaining, 'if');
  } else {
    if (noOfParticipants >= user_postion) {
      go_next = true;
      streamPosition = noOfParticipants - 1;
    } else {
      go_next = false;
    }
  }
  if (go_next && count != 1) {
    let next = await StreamPreRegister.findOne({
      streamId: req.body.streamId,
      status: 'Registered',
      _id: { $ne: findresult._id },
    })
      .sort({ DateIso: 1 })
      .skip(streamPosition);
    if (next) {
      next.eligible = true;
      next.viewstatus = 'Confirmed';
      next.streamCount = user_postion;
      let streamDetails = await Streamrequest.findById(next.streamId);
      let notification = await shopNotification.create({
        DateIso: moment(),
        created: moment(),
        shopId: next.shopId,
        streamId: next.streamId,
        streamRegister: next._id,
        type: 'stream',
        streamObject: streamDetails,
        streamRegisterobject: next,
        streamName: streamDetails.streamName,
        title: streamDetails.streamName + ' Stream Is Available to Watch',
      });
      let count = await shopNotification.find({ shopId: next.shopId, status: 'created' }).count();
      req.io.emit(next.shopId + '_stream_CFM', { notification, count: count });
      next.save();
    }
  }
  await single_stream_details(req);
  let update = await StreamPreRegister.find({ streamId: participents._id, eligible: false })
    .sort({ DateIso: -1 })
    .limit(participents.noOfParticipants / 2);
  //console.log(update);
  update.forEach(async (e) => {
    e.viewstatus = 'RAC';
    e.save();
  });
  return findresult;
};

const single_stream_details = async (req) => {
  setTimeout(async () => {
    let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: 'Registered' }).count();
    //console.log(count);
    req.io.emit(req.body.streamId + '_userjoined', { count: count, streamId: req.body.streamId });
  }, 300);
};

const purchase_details = async (req) => {
  let planId = req.query.id;
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let date = req.query.date;
  let supplier = req.query.supplier;
  dateMatch = { active: { $in: [true, false] } };
  supplierMatch = { active: { $in: [true, false] } };
  if (supplier != null && supplier != 'null' && supplier != '') {
    supplierMatch = { suppierId: { $eq: supplier } };
  }
  if (date != null && date != 'null' && date != '') {
    dateMatch = { date: { $eq: date } };
  }
  let plan = await Streamplan.findById(req.query.id);
  let value = await purchasePlan.aggregate([
    {
      $addFields: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
      },
    },
    {
      $match: {
        $and: [{ planId: { $eq: planId } }, dateMatch, supplierMatch],
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $addFields: {
        primaryContactName: '$suppliers.primaryContactName',
      },
    },
    {
      $addFields: {
        primaryContactNumber: '$suppliers.primaryContactNumber',
      },
    },
    {
      $lookup: {
        from: 'streamplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'streamplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamplans',
      },
    },
    {
      $addFields: {
        planValidity: '$streamplans.validityofplan',
      },
    },
    {
      $addFields: {
        numberofStream: '$streamplans.numberofStream',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await purchasePlan.aggregate([
    {
      $addFields: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
      },
    },
    {
      $match: {
        $and: [{ planId: { $eq: planId } }, dateMatch, supplierMatch],
      },
    },
  ]);

  return { plan, value, total: total.length };
};

const purchase_details_supplier = async (req) => {
  let planId = req.query.id;
  let suplier = await purchasePlan.aggregate([
    {
      $match: {
        $and: [{ planId: { $eq: planId } }],
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
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $addFields: {
        primaryContactName: '$suppliers.primaryContactName',
      },
    },
    {
      $addFields: {
        primaryContactNumber: '$suppliers.primaryContactNumber',
      },
    },
    {
      $addFields: {
        supllierId: '$suppliers._id',
      },
    },
    {
      $group: {
        _id: {
          supllierId: '$supllierId',
          primaryContactName: '$primaryContactName',
          primaryContactNumber: '$primaryContactNumber',
        },
      },
    },
    {
      $project: {
        _id: '$_id.supllierId',
        primaryContactName: '$_id.primaryContactName',
        primaryContactNumber: '$_id.primaryContactNumber',
      },
    },
  ]);

  return suplier;
};

const purchase_link_plan = async (req) => {
  let expireMinutes = moment().add(req.body.expireMinutes, 'minutes');
  let value = await streamPlanlink.create({ ...req.body, ...{ expireTime: expireMinutes } });
  let data = {
    exp: expireMinutes,
    supplier: req.body.supplier,
    plan: req.body.plan,
    _id: value._id,
  };
  const link = await generateLink.generateLink(data);
  value.token = link;
  await Dates.create_date(value);
  return value;
};
const purchase_link_plan_get = async (req) => {
  const verify = await generateLink.verifyLink(req.query.link);
  let value = await streamPlanlink.aggregate([
    { $match: { $and: [{ _id: { $eq: verify._id } }, { status: { $eq: 'created' } }] } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streamplans',
        localField: 'plan',
        foreignField: '_id',
        as: 'plan_details',
      },
    },
    { $unwind: '$plan_details' },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan Already Purchased');
  }
  return value[0];
};

const get_stream_post = async (req) => {
  let value = await StreamPost.aggregate([
    {
      $lookup: {
        from: 'streamrequestposts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { $and: [{ streamRequest: { $eq: req.query.id } }] } }],
        as: 'streamrequestposts',
      },
    },
    { $unwind: '$streamrequestposts' },
  ]);
  return value[0];
};

const get_stream_alert = async (req) => {
  var date_now = new Date().getTime();
  let value = await Streamrequest.aggregate([
    {
      $match: {
        $and: [
          { tokenGeneration: { $eq: false } },
          { endTime: { $gt: date_now } },
          { adminApprove: { $eq: 'Approved' } },
          { suppierId: { $eq: req.userId } },
          { status: { $ne: 'Cancelled' } },
          { status: { $ne: 'Completed' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
  ]);
  return value;
};

const get_cancel_stream = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  const value = await Streamrequest.aggregate([
    {
      $match: {
        $and: [{ tokenGeneration: { $eq: false } }, { startTime: { $lt: date_now } }, { status: { $ne: 'Cancelled' } }],
      },
    },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.primaryContactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
      },
    },

    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    {
      $match: {
        $and: [{ tokenGeneration: { $eq: false } }, { startTime: { $lt: date_now } }, { status: { $ne: 'Cancelled' } }],
      },
    },
  ]);
  return { value, total: total.length };
};

const create_slab = async (req) => {
  let value = await Slab.create(req.body);
  await Dates.create_date(value);
  return value;
};
const get_by_slab = async (req) => {
  let value = await Slab.findById(req.query.id);
  return value;
};

const getallslab = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const value = await Slab.aggregate([{ $sort: { DateIso: -1 } }, { $skip: 10 * page }, { $limit: 10 }]);

  return value;
};
const update_slab = async (req) => {
  let value = await Slab.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true });
  return value;
};

const get_completed_stream_buyer = async (req) => {
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: req.query.id } }] } },
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
                { $match: { $and: [{ afterStreaming: { $eq: 'yes' } }, { status: { $ne: 'Removed' } }] } },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
                    image: '$products.image',
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
                    bookingAmount: 1,
                    products: '$products',
                    status: 1,
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              active: 1,
              archive: 1,
              productId: '$streamposts.productId',
              productTitle: '$streamposts.products.productTitle',
              image: '$streamposts.products.image',
              categoryId: 'a7c95af4-abd5-4fe0-b685-fd93bb98f5ec',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              bookingAmount: '$streamposts.bookingAmount',
              streamPostId: '$streamposts._id',
              allowAdd_to_cart: { $gte: ['$streamposts.pendingQTY', '$streamposts.minLots'] },
              suppierId: 1,
              DateIso: 1,
              created: '2023-01-20T11:46:58.201Z',
              postStatus: '$streamposts.status',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $eq: 'CloudRecording' } }, { videoLink: { $ne: '' } }, { videoLink: { $ne: null } }],
            },
          },
        ],
        as: 'temptokens',
      },
    },
    {
      $project: {
        _id: 1,
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        streamrequestposts_count: '$streamrequestposts_count',
        temptokens: '$temptokens',
      },
    },
  ]);
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return value[0];
};
const get_completed_stream_byid = async (req) => {
  const value = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: req.query.id } }] } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streamrequests',
        localField: '_id',
        foreignField: '_id',
        as: 'streamrequests',
      },
    },
    { $unwind: '$streamrequests' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
        streamrequests: '$streamrequests',
      },
    },
  ]);

  return { value };
};
const get_completed_stream_upcommming = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
    // //console.log(date, dateMatch)
  }
  const value = await Streamrequest.aggregate([
    { $sort: { DateIso: 1 } },
    { $match: { $and: [dateMatch, { startTime: { $gt: date_now } }, { status: { $ne: 'Cancelled' } }] } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'suppierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { startTime: { $gt: date_now } }, { status: { $ne: 'Cancelled' } }] } },
  ]);
  return { value, total: total.length };
};

const get_completed_stream_live = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
    // //console.log(date, dateMatch)
  }
  const value = await Streamrequest.aggregate([
    { $sort: { DateIso: 1 } },
    {
      $match: {
        $and: [
          dateMatch,
          { startTime: { $lt: date_now } },
          { endTime: { $gt: date_now } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    {
      $match: {
        $and: [
          dateMatch,
          { startTime: { $lt: date_now } },
          { endTime: { $gt: date_now } },
          { status: { $ne: 'Cancelled' } },
        ],
      },
    },
  ]);
  return { value, total: total.length };
};

const get_completed_stream_completed = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var date_now = new Date().getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
    // //console.log(date, dateMatch)
  }
  const value = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }] } },
    { $sort: { DateIso: 1 } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }] } },
  ]);
  return { value, total: total.length };
};

const get_completed_stream_expired = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var today = new Date();
  var date_now = new Date(new Date().setDate(today.getDate() + 30)).getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
    // //console.log(date, dateMatch)
  }
  // //console.log(date_now);
  const value = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }] } },
    { $sort: { DateIso: 1 } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
      },
    },

    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { endTime: { $lte: date_now } }, { status: { $ne: 'Cancelled' } }] } },
  ]);
  return { value, total: total.length };
};

const get_completed_stream_removed = async (req) => {
  return { message: true };
};

const get_completed_stream_cancelled = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  var today = new Date();
  var date_now = new Date(new Date().setDate(today.getDate() + 30)).getTime();
  let filterdate = req.query.date;
  dateMatch = { active: true };
  if (filterdate != null && filterdate != '' && filterdate != 'null') {
    let date = filterdate.split(',');
    if (date.length == 2) {
      dateMatch = { $and: [{ streamingDate: { $gte: date[0] } }, { streamingDate: { $lte: date[1] } }] };
    }
    // //console.log(date, dateMatch)
  }
  // //console.log(date_now);
  const value = await Streamrequest.aggregate([
    { $match: { $and: [dateMatch, { status: { $eq: 'Cancelled' } }] } },
    { $sort: { DateIso: 1 } },
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    productTitle: '$products.productTitle',
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
                  },
                },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              productTitle: '$streamposts.productTitle',
              productId: '$streamposts.productId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              validity: '$streamposts.validity',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
            },
          },
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
    { $unwind: '$suppliers' },
    {
      $lookup: {
        from: 'streampreregisters',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { status: { $eq: 'Registered' } } }, { $group: { _id: null, count: { $sum: 1 } } }],
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
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$purchasedplans',
      },
    },
    {
      $addFields: {
        max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_chat',
        foreignField: '_id',
        as: 'allot_chat_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_chat_lookup',
      },
    },
    {
      $addFields: {
        allot_chat_name: { $ifNull: ['$allot_chat_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_1',
        foreignField: '_id',
        as: 'allot_host_1_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_1_lookup',
      },
    },
    {
      $addFields: {
        allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_2',
        foreignField: '_id',
        as: 'allot_host_2_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_2_lookup',
      },
    },
    {
      $addFields: {
        allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'allot_host_3',
        foreignField: '_id',
        as: 'allot_host_3_lookup',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$allot_host_3_lookup',
      },
    },
    {
      $addFields: {
        allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.contactName', null] },
      },
    },
    {
      $lookup: {
        from: 'purchasedplans',
        localField: 'planId',
        foreignField: '_id',
        as: 'purchasedplans',
      },
    },
    {
      $unwind: '$purchasedplans',
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'host' } }] } }],
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
        supplierName: '$suppliers.contactName',
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
        streamrequestposts: '$streamrequestposts',
        adminApprove: 1,
        tokenGeneration: 1,
        tokenDetails: 1,
        Duration: 1,
        startTime: 1,
        endTime: 1,
        registeredUsers: 1,
        noOfParticipants: 1,
        max_post_per_stream: 1,
        status: 1,
        allot_chat_name: 1,
        allot_host_1_name: 1,
        allot_host_2_name: 1,
        allot_host_3_name: 1,
        no_of_host: '$purchasedplans.no_of_host',
        allot_host_1: 1,
        allot_host_2: 1,
        allot_host_3: 1,
        allot_chat: 1,
        temptokens: '$temptokens',
      },
    },
    { $sort: { DateIso: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const total = await Streamrequest.aggregate([{ $match: { $and: [dateMatch, { status: { $eq: 'Cancelled' } }] } }]);
  return { value, total: total.length };
};

// completed Stream Supplier Side Flow

const getStock_Manager = async (req) => {
  let page = req.params.page == '' || req.params.page == null || req.params.page == null ? 0 : req.params.page;
  let accessBy = req.accessBy;
  let currentTime = new Date().getTime();
  let values = await Streamrequest.aggregate([
    // endTime: { $lt: currentTime }
    {
      $match: {
        $or: [
          { endTime: { $lt: currentTime }, suppierId: { $eq: accessBy } },
          { status: 'Completed', suppierId: { $eq: accessBy } },
        ],
      },
    },
    {
      $sort: { created: -1 },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        as: 'buyers',
      },
    },
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
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$products',
                  },
                },
              ],
              as: 'streamPost',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$streamPost',
            },
          },
          {
            $lookup: {
              from: 'streamingorderproducts',
              localField: '_id',
              foreignField: 'postId',
              pipeline: [{ $group: { _id: null, sumValue: { $sum: '$purchase_quantity' } } }],
              as: 'orderProducts',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$orderProducts',
            },
          },
          {
            $lookup: {
              from: 'streamrequests',
              localField: 'streamRequest',
              foreignField: '_id',
              as: 'Stream',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$Stream',
            },
          },
          {
            $project: {
              _id: 1,
              postId: 1,
              productName: '$streamPost.products.productTitle',
              PostedKg: '$streamPost.quantity',
              Bookedkg: { $ifNull: ['$orderProducts.sumValue', 0] },
              streamName: '$Stream.streamName',
            },
          },
        ],
        as: 'streamPost',
      },
    },
    {
      $project: {
        _id: 1,
        streamName: 1,
        streamingDate_time: 1,
        No_Of_Post: { $size: '$post' },
        aggregatedBuyers: { $size: '$buyers' },
        startTime: 1,
        endTime: 1,
        created: 1,
        status: 'Pending',
        streamPost: '$streamPost',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Streamrequest.aggregate([
    {
      $match: {
        $or: [
          { endTime: { $lt: currentTime }, suppierId: { $eq: accessBy } },
          { status: 'Completed', suppierId: { $eq: accessBy } },
        ],
      },
    },
    {
      $sort: { created: -1 },
    },
    {
      $lookup: {
        from: 'joinedusers',
        localField: '_id',
        foreignField: 'streamId',
        as: 'buyers',
      },
    },
    {
      $skip: 10 * (page + 1),
    },
    {
      $limit: 10,
    },
  ]);
  return { values: values, next: total.length != 0 };
};

const getPosted_Details_By_Stream = async (id) => {
  let values = await StreamrequestPost.aggregate([
    {
      $match: { streamRequest: id },
    },
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
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$products',
            },
          },
        ],
        as: 'streamPost',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamPost',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $group: { _id: null, sumValue: { $sum: '$purchase_quantity' } } }],
        as: 'orderProducts',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderProducts',
      },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamRequest',
        foreignField: '_id',
        as: 'Stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Stream',
      },
    },
    {
      $project: {
        _id: 1,
        postId: 1,
        productName: '$streamPost.products.productTitle',
        PostedKg: '$streamPost.quantity',
        Bookedkg: { $ifNull: ['$orderProducts.sumValue', 0] },
        streamName: '$Stream.streamName',
      },
    },
  ]);
  return values;
};

// fetch specific streaming details

const fetchStream_Details_ById = async (id) => {
  let stream = await Streamrequest.findById(id);
  let values = await StreamrequestPost.aggregate([
    {
      $match: {
        streamRequest: id,
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'Pending' } }],
        as: 'Pending',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'approved' } }],
        as: 'confirm',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'denied' } }],
        as: 'denied',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'cancelled' } }],
        as: 'cancelled',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$purchase_quantity' } } }],
        as: 'confirmQty',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$confirmQty',
      },
    },
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
              as: 'product',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$product',
            },
          },
        ],
        as: 'streamPost',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streamPost',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        as: 'streamingorderProduct',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'postId',
        pipeline: [{ $match: { status: 'Pending' } }],
        as: 'status',
      },
    },
    { $addFields: { counts: { $size: '$status' } } },
    { $addFields: { productId: '$streamPost.product._id' } },
    {
      $lookup: {
        from: 'streamingorderproducts',
        let: { streamId: '$streamRequest', productId: '$streamPost.product._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$streamId', '$$streamId'],
                  },
                  {
                    $eq: ['$productId', '$$productId'],
                  },
                ],
              },
            },
          },
        ],
        as: 'streamOrders',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        let: { streamId: '$streamRequest', productId: '$streamPost.product._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$streamId', '$$streamId'],
                  },
                  {
                    $eq: ['$productId', '$$productId'],
                  },
                  {
                    $eq: ['$status', 'Pending'],
                  },
                ],
              },
            },
          },
        ],
        as: 'streamOrderscount',
      },
    },
    {
      $project: {
        _id: 1,
        Buyer: { $size: '$streamOrders' },
        streamRequest: 1,
        Cancelled: { $size: '$cancelled' },
        ConfirmedQuantity: { $ifNull: ['$confirmQty.total', 0] },
        InitiatedQuantity: '$streamPost.quantity',
        Pending: { $size: '$streamOrderscount' },
        confirmed: { $size: '$confirm' },
        denied: { $size: '$denied' },
        productName: '$streamPost.product.productTitle',
        productId: '$streamPost.product._id',
        status: {
          $cond: [{ $gt: ['$counts', 0] }, 'Pending', 'Completed'],
        },
        streamOrders: '$streamOrders',
      },
    },
  ]);

  return { values, stream };
};

// Intimation Buyer Flow

const fetch_Stream_Ordered_Details = async (id, query) => {
  let buyerSearch = { _id: { $ne: null } };
  let statusSearch = { _id: { $ne: null } };
  let page = query.page == '' || query.page == null || query.page == null ? 0 : query.page;

  if (!query.buyer == '' && query.buyer) {
    buyerSearch = {
      $or: [{ name: { $regex: query.buyer, $options: 'i' } }, { orderId: { $regex: query.buyer, $options: 'i' } }],
    };
  } else {
    buyerSearch;
  }
  if (!query.status == '' && query.status) {
    statusSearch = { $or: [{ orderStatus: { $regex: query.status, $options: 'i' } }] };
  } else {
    statusSearch;
  }
  let stream = await Streamrequest.findById(id);
  let values = await streamingOrder.aggregate([
    {
      $match: {
        streamId: id,
      },
    },
    {
      $match: buyerSearch,
    },
    {
      $match: statusSearch,
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stream',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shops',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              status: 1,
              purchase_quantity: 1,
              purchase_price: 1,
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'orderedProducts',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { status: { $ne: 'Pending' } } }],
        as: 'Actions',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        as: 'ordercount',
      },
    },
    {
      $project: {
        _id: 1,
        name: '$shops.SName',
        orderId: 1,
        No_Of_Product: { $size: '$ordercount' },
        ordered: { $size: '$Actions' },
        orderStatus: 1,
        orderedProducts: '$orderedProducts',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await streamingOrder.aggregate([
    {
      $match: {
        streamId: id,
      },
    },
    {
      $match: { $or: [buyerSearch] },
    },
    {
      $match: { $or: [statusSearch] },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stream',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shops',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              status: 1,
              purchase_quantity: 1,
              purchase_price: 1,
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'orderedProducts',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { status: { $ne: 'Pending' } } }],
        as: 'Actions',
      },
    },
    {
      $skip: 10 * (page + 1),
    },
    {
      $limit: 10,
    },
  ]);
  return { values: values, total: total.length, stream };
};

const update_Status_For_StreamingOrders = async (id, body) => {
  let values = await streamingOrder.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'streaming order not found 🖕');
  }
  values = await streamingOrder.findByIdAndUpdate({ _id: id }, { orderStatus: body.status }, { new: true });
  return values;
};

const fetch_streaming_Details_Approval = async (id, query, req) => {
  let buyerSearch = { _id: { $ne: null } };
  let statusSearch = { _id: { $ne: null } };
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);

  if (!query.buyer == '' && query.buyer) {
    buyerSearch = { name: { $regex: query.buyer, $options: 'i' } };
  } else {
    buyerSearch;
  }
  if (!query.status == '' && query.status) {
    statusSearch = { status: { $regex: query.status, $options: 'i' } };
  } else {
    statusSearch;
  }
  let streamdetails = await StreamrequestPost.aggregate([
    { $match: { $and: [{ _id: { $eq: id } }] } },
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
          { $unwind: '$products' },
        ],
        as: 'streamposts',
      },
    },
    { $unwind: '$streamposts' },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamRequest',
        foreignField: '_id',
        as: 'streamrequests',
      },
    },
    { $unwind: '$streamrequests' },
    {
      $project: {
        _id: 1,
        streamName: '$streamrequests.streamName',
        startTime: '$streamrequests.startTime',
        productTitle: '$streamposts.products.productTitle',
        streamEnd_Time: '$streamrequests.streamEnd_Time',
      },
    },
  ]);
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
      },
    },
    {
      $match: { $or: [statusSearch] },
    },
    {
      $lookup: {
        from: 'streamingorders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'orders',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orders',
      },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'streaming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streaming',
      },
    },
    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        as: 'orderPayment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderPayment',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shops',
      },
    },
    {
      $project: {
        _id: 1,
        checkout: '$orderPayment.created',
        streamingDate: '$streaming.streamingDate_time',
        streamingStart: '$streaming.startTime',
        streamEndTime: '$streaming.endTime',
        streamingName: '$streaming.streamName',
        orderedKg: '$purchase_quantity',
        approvalStatus: '$status',
        name: '$shops.SName',
        orderId: '$orders._id',
      },
    },
    {
      $match: { $or: [buyerSearch] },
    },

    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);

  let total = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
      },
    },
    {
      $match: { $or: [statusSearch] },
    },
    {
      $lookup: {
        from: 'streamingorders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'orders',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orders',
      },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'streaming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$streaming',
      },
    },
    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        as: 'orderPayment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderPayment',
      },
    },
    {
      $project: {
        _id: 1,
        checkout: '$orderPayment.created',
        streamingDate: '$streaming.streamingDate_time',
        streamingStart: '$streaming.startTime',
        streamEndTime: '$streaming.endTime',
        streamingName: '$streaming.streamName',
        orderedKg: '$purchase_quantity',
        approvalStatus: '$status',
        name: '$orders.name',
      },
    },
    {
      $match: { $or: [buyerSearch] },
    },
    {
      $skip: 10 * (page + 1),
    },
    {
      $limit: 10,
    },
  ]);
  let ordered = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
      },
    },
    {
      $group: {
        _id: null,
        orderedKg: { $sum: '$purchase_quantity' },
      },
    },
  ]);
  let confirmed = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: null,
        // productId: product,
        orderedKg: { $sum: '$purchase_quantity' },
      },
    },
  ]);
  let denied = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
        status: 'denied',
      },
    },
    {
      $group: {
        _id: null,
        orderedKg: { $sum: '$purchase_quantity' },
      },
    },
  ]);
  let cancelled = await streamingorderProduct.aggregate([
    {
      $match: {
        postId: id,
        status: 'cancelled',
      },
    },
    {
      $group: {
        _id: null,
        orderedKg: { $sum: '$purchase_quantity' },
      },
    },
  ]);

  return {
    values: values,
    orderedKg: ordered.length > 0 ? ordered[0].orderedKg : 0,
    confirmedKg: confirmed.length > 0 ? confirmed[0].orderedKg : 0,
    cancelledKg: cancelled.length > 0 ? cancelled[0].orderedKg : 0,
    deniedKg: denied.length > 0 ? denied[0].orderedKg : 0,
    next: total.length != 0,
    streamdetails: streamdetails[0],
  };
};

const update_approval_Status = async (id, body) => {
  let values = await streamingOrder.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'streaming order not found 🖕');
  }
  values = await streamingOrder.findByIdAndUpdate({ _id: id }, { approvalStatus: body.status }, { new: true });
  return values;
};

const update_productOrders = async (id, body) => {
  let values = await streamingorderProduct.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'streaming order not found 🖕');
  }
  let orderId = values.orderId;
  values = await streamingorderProduct.findByIdAndUpdate({ _id: id }, { status: body.status }, { new: true });
  let totalOrder = await streamingorderProduct.find({ orderId: orderId }).count();
  let pendingCount = await streamingorderProduct.find({ orderId: orderId, status: 'Pending' }).count();
  let streamorder = await streamingOrder.findById(orderId);

  if (pendingCount == 0 && streamorder.orderStatus != 'confirmed' && streamorder.orderStatus != 'ready') {
    await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'ready' }, { new: true });
  }
  if (pendingCount != 0) {
    if (totalOrder != pendingCount) {
      await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'partial' }, { new: true });
    }
  }
  return values;
};

const multipleCancel = async (body) => {
  const { arr, status } = body;
  arr.forEach(async (e) => {
    let values = await streamingorderProduct.findById(e);
    let orderId = values.orderId;
    values = await streamingorderProduct.findByIdAndUpdate({ _id: e }, { status: body.status }, { new: true });
    let totalOrder = await streamingorderProduct.find({ orderId: orderId }).count();
    let pendingCount = await streamingorderProduct.find({ orderId: orderId, status: 'Pending' }).count();
    let streamorder = await streamingOrder.findById(orderId);

    if (pendingCount == 0 && streamorder.orderStatus != 'confirmed' && streamorder.orderStatus != 'ready') {
      await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'ready' }, { new: true });
    }
    if (pendingCount != 0) {
      if (totalOrder != pendingCount) {
        await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'partial' }, { new: true });
      }
    }
  });
  return { message: 'Updated......' };
};

const update_Multiple_productOrders = async (body) => {
  body.arr.forEach(async (e) => {
    let values = await streamingorderProduct.findById(e);
    if (values) {
      values = await streamingorderProduct.findByIdAndUpdate({ _id: e }, { status: body.status }, { new: true });
      let orderId = values.orderId;
      values = await streamingorderProduct.findByIdAndUpdate({ _id: e }, { status: body.status }, { new: true });
      let totalOrder = await streamingorderProduct.find({ orderId: orderId }).count();
      let pendingCount = await streamingorderProduct.find({ orderId: orderId, status: 'Pending' }).count();
      let streamorder = await streamingOrder.findById(orderId);

      if (pendingCount == 0 && streamorder.orderStatus != 'confirmed' && streamorder.orderStatus != 'ready') {
        await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'ready' }, { new: true });
      }
      if (pendingCount != 0) {
        if (totalOrder != pendingCount) {
          await streamingOrder.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'partial' }, { new: true });
        }
      }
    }
  });
  return { message: 'Updated...........' };
};

const update_Multiple_approval_Status = async (body) => {
  //console.log(body.arr);
  body.arr.forEach(async (e) => {
    let values = await streamingOrder.findById(e);
    values = await streamingOrder.findByIdAndUpdate({ _id: e }, { approvalStatus: body.status }, { new: true });
  });
  return { message: 'Updated...........' };
};

// Buyer FLow

const fetch_Stream_Details_For_Buyer = async (buyerId) => {
  let value = await streamingOrder.aggregate([
    {
      $match: {
        shopId: buyerId,
      },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'streaming',
      },
    },
    {
      $unwind: '$streaming',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shop',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'cancelled' } },
          { $group: { _id: null, amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'cancelAmount',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$cancelAmount',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'rejected' } },
          { $group: { _id: null, amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'RejectAmount',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$RejectAmount',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'denied' } },
          { $group: { _id: null, amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'DeniedAmount',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$DeniedAmount',
      },
    },
    {
      $addFields: {
        RejectAmount: '$RejectAmount.amt',
        DeniedAmount: '$DeniedAmount.amt',
        cancelAmount: '$cancelAmount.amt',
      },
    },
    // {
    //   $addFields: {
    //     Amount: {
    //       $add: [{ $ifnull: ['$RejectAmount', 0] }, { $ifNull: ['$DeniedAmount', 0] }, { $ifNull: ['$cancelAmount', 0] }],
    //     },
    //   },
    // },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$products',
            },
          },
        ],
        as: 'orders',
      },
    },
    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orderPayment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderPayment',
      },
    },
    {
      $project: {
        _id: 1,
        streamName: '$streaming.streamName',
        streamingDate: '$streaming.streamingDate',
        startTime: '$streaming.startTime',
        endTime: '$streaming.endTime',
        shopName: '$shop.SName',
        orderId: 1,
        totalAmount: 1,
        bookingAmount: '$orderPayment.paidAmt',
        balanceAmount: { $subtract: ['$totalAmount', { $ifNull: ['$orderPayment.paidAmt', 0] }] },
        addedAmount: {
          $add: [{ $ifNull: ['$RejectAmount', 0] }, { $ifNull: ['$DeniedAmount', 0] }, { $ifNull: ['$cancelAmount', 0] }],
        },
        orderStatus: 1,
        orders: '$orders',

        RejectAmount: { $ifNull: ['$RejectAmount', 0] },
        DeniedAmount: { $ifNull: ['$DeniedAmount', 0] },
        cancelAmount: { $ifNull: ['$cancelAmount', 0] },
      },
    },
  ]);
  return value;
};

// update Joined User Status For Buyer Flow

const update_Joined_User_Status_For_Buyer = async (id, body) => {
  let values = await Joinusers.findById(id);
  //console.log(values);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Buyer Not Found 🖕');
  }
  values = await Joinusers.findByIdAndUpdate({ _id: id }, { status: body.status }, { new: true });
  return values;
};

const fetch_Stream_Product_Details = async (id) => {
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        streamId: id,
      },
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stream',
      },
    },
    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        as: 'orderPayment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderPayment',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$products',
      },
    },
    {
      $project: {
        _id: 1,
        purchase_quantity: 1,
        purchase_price: 1,
        TotalAmt: '$orderPayment.totalAmount',
        paidAmt: '$orderPayment.paidAmt',
        PendingAmt: { $subtract: ['$orderPayment.totalAmount', '$orderPayment.paidAmt'] },
        status: 1,
        streamName: '$stream.streamName',
        streamDate: '$stream.streamingDate_time',
        streamId: '$stream._id',
        productName: '$products.productTitle',
      },
    },
  ]);
  return values;
};

const fetch_stream_Payment_Details = async (id) => {
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        streamId: id,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$product',
      },
    },
    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        as: 'orderPayment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$orderPayment',
      },
    },
    {
      $project: {
        _id: 1,
        streamId: 1,
        purchase_quantity: 1,
        TotalAmt: '$orderPayment.totalAmount',
        paidAmt: '$orderPayment.paidAmt',
        PendingAmt: { $subtract: ['$orderPayment.totalAmount', '$orderPayment.paidAmt'] },
        status: 1,
      },
    },
  ]);
  let orderDetails = {
    orderedAmt: 'Dummy Data',
    paidAmt: 'Dummy Data',
    cancelledAmt: 'Dummy Data',
    Rejected: 'Dummy Data',
    Denied: 'DUmmy Data',
    confirmedAmt: 'Dummy Data',
    PaidAmount: 'Dummy Data',
    BalanceAmt: 'Dummy Data',
  };
  return { values: values, orderDetails: orderDetails };
};

const Fetch_Streaming_Details_By_buyer = async (buyerId) => {
  const values = await streamingOrder.aggregate([
    {
      shopId: buyerId,
    },
  ]);
  return values;
};

const getStreaming_orders_By_orders = async (id) => {
  const value = await streamingorderProduct.aggregate([
    {
      $match: { orderId: id },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        as: 'stream',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stream',
      },
    },
    {
      $project: {
        _id: 1,
        status: 1,
        purchase_quantity: 1,
        purchase_price: 1,
        streamId: 1,
        product: '$products.productTitle',
        streamName: '$stream.streamName',
        startTime: '$stream.startTime',
        endTime: '$stream.endTime',
        orderId: 1,
      },
    },
  ]);

  let orderAmount = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
    {
      $group: {
        _id: null,
        Amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);

  let payment = await streamingorderPayments.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
  ]);
  return {
    values: value,
    payment: payment.length > 0 ? payment[0] : {},
    orderAmount: orderAmount.length > 0 ? orderAmount[0] : {},
  };
};

const getStreaming_orders_By_orders_for_pay = async (id) => {
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$product',
      },
    },
    // streamingorderpayments

    {
      $lookup: {
        from: 'streamingorderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        as: 'Payment',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Payment',
      },
    },
    {
      $project: {
        _id: 1,
        product: '$product.productTitle',
        Quantity: '$purchase_quantity',
        price: '$purchase_price',
        status: 1,
      },
    },
  ]);
  let payment = await streamingorderPayments.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
  ]);

  let cancelled = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'cancelled',
      },
    },
    {
      $group: { _id: null, total: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } },
    },
  ]);
  let Denied = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'denied',
      },
    },
    {
      $group: { _id: null, total: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } },
    },
  ]);

  let Rejected = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'rejected',
      },
    },
    {
      $group: { _id: null, total: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } },
    },
  ]);

  let orderedAmt = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
    {
      $group: {
        _id: null,
        Amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);

  let Approved = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'approved',
      },
    },
    {
      $group: { _id: null, total: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } },
    },
  ]);
  return {
    values: values,
    payment: payment.length != 0 ? payment[0] : {},
    Rejected: Rejected.length != 0 ? Rejected[0].total : 0,
    Approved: Approved.length != 0 ? Approved[0].total : 0,
    Denied: Denied.length != 0 ? Denied[0].total : 0,
    cancelled: cancelled.length != 0 ? cancelled[0].total : 0,
    orderedAmt: orderedAmt.length > 0 ? orderedAmt[0] : {},
  };
};

// Account Manager Flow

const getOrder_For_Account_Manager = async (id) => {
  let values = await streamingOrder.aggregate([
    {
      $match: {
        streamId: id,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shops',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'cancelled' } },
          { $group: { _id: null, cancelAmt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'cancelled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$cancelled',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'rejected' } },
          { $group: { _id: null, cancelAmt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'rejected',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$rejected',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { status: 'denied' } },
          { $group: { _id: null, cancelAmt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } } } },
        ],
        as: 'denied',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$denied',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { status: 'denied' } }],
        as: 'deniedCount',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { status: 'rejected' } }],
        as: 'rejectCount',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { status: 'cancelled' } }],
        as: 'cancelCount',
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        as: 'ordersCount',
      },
    },
    {
      $addFields: {
        cancelledAmount: { $ifNull: ['$cancelled.cancelAmt', 0] },
      },
    },
    {
      $addFields: {
        RejectAmount: { $ifNull: ['$rejected.cancelAmt', 0] },
      },
    },
    {
      $addFields: {
        DeniedAmount: { $ifNull: ['$denied.cancelAmt', 0] },
      },
    },
    {
      $addFields: {
        PendingAmount: { $ifNull: [{ $subtract: ['$totalAmount', '$Amount'] }, 0] },
      },
    },
    {
      $addFields: {
        finalAmount: { $ifNull: [{ $add: ['$DeniedAmount', '$cancelledAmount', '$RejectAmount'] }, 0] },
      },
    },
    {
      $addFields: {
        Balance: { $subtract: ['$PendingAmount', '$finalAmount'] },
      },
    },
    {
      $addFields: {
        refund: {
          $ifNull: [{ $cond: { if: { $lt: ['$Balance', 0] }, then: { $abs: '$Balance' }, else: 0 } }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        orderStatus: 1,
        totalAmount: 1,
        Buyer: '$shops.SName',
        PendingAmount: 1,
        Amount: 1,
        cancelCount: { $size: '$cancelCount' },
        rejectCount: { $size: '$rejectCount' },
        deniedCount: { $size: '$deniedCount' },
        ordersCount: { $size: '$ordersCount' },
        cancelledAmount: 1,
        RejectAmount: 1,
        DeniedAmount: 1,
        finalAmount: 1,
        Balance: 1,
        refund: 1,
      },
    },
  ]);
  return values;
};

const getDetails = async (id) => {
  let values = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$products',
      },
    },
    {
      $addFields: { Amount: { $toInt: { $multiply: ['$purchase_quantity', '$purchase_price'] } } },
    },

    {
      $lookup: {
        from: 'streamrequestposts',
        localField: 'postId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'streamposts',
              localField: 'postId',
              foreignField: '_id',
              pipeline: [{ $match: { bookingAmount: 'yes' } }],
              as: 'post',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$post',
            },
          },
        ],
        as: 'requestPOst',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$requestPOst',
      },
    },
    {
      $addFields: { bookingAmount: '$requestPOst.post.bookingAmount' },
    },
    {
      $lookup: {
        from: 'slabdetails',
        let: { formAmount: '$Amount', endAmount: '$Amount', bookingAmount: '$bookingAmount' },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $gte: ['$$formAmount', '$formAmount'] } },
                { $expr: { $lte: ['$$endAmount', '$endAmount'] } },
                { $expr: { $eq: ['$$bookingAmount', 'yes'] } },
              ],
            },
          },
          { $limit: 1 },
        ],
        as: 'slab',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$slab',
      },
    },
    {
      $addFields: { slabPercentage: { $ifNull: ['$slab.slabPercentage', 0] } },
    },
    {
      $addFields: {
        bookingAmount: {
          $divide: [
            {
              $multiply: ['$slabPercentage', '$Amount'],
            },
            100,
          ],
        },
      },
    },

    {
      $project: {
        _id: 1,
        status: 1,
        purchase_quantity: 1,
        purchase_price: 1,
        Amount: 1,
        product: '$products.productTitle',
        slabPercentage: 1,
        bookingAmount: 1,
      },
    },
  ]);
  let orderPayMent = await streamingorderPayments.findOne({ orderId: id });
  let cancelAmt = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'cancelled',
      },
    },
    {
      $group: {
        _id: null,
        amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);
  let rejectAmt = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'rejected',
      },
    },
    {
      $group: {
        _id: null,
        amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);
  let deniedAmt = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
        status: 'denied',
      },
    },
    {
      $group: {
        _id: null,
        amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);

  let orderedAmount = await streamingorderProduct.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
    {
      $group: {
        _id: null,
        amt: { $sum: { $multiply: ['$purchase_quantity', '$purchase_price'] } },
      },
    },
  ]);

  return {
    values: values,
    orderPayMent: orderPayMent,
    cancelAmt: cancelAmt.length > 0 ? cancelAmt[0].amt : 0,
    deniedAmt: deniedAmt.length > 0 ? deniedAmt[0].amt : 0,
    rejectAmt: rejectAmt.length > 0 ? rejectAmt[0].amt : 0,
    orderAmount: orderedAmount.length > 0 ? orderedAmount[0].amt : 0,
  };
};

const get_notification_count = async (req) => {
  let notification = await shopNotification.find({ shopId: req.shopId, status: 'created' }).count();

  return { count: notification };
};

const get_notification_viewed = async (req) => {
  let notification = await shopNotification.findById(req.query.notificaion);

  if (notification.shopId != req.shopId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  notification.status = 'viewed';
  notification.save();
  return notification;
};

const get_notification_getall = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  let notification = await shopNotification
    .find({ shopId: req.shopId })
    .sort({ DateIso: -1 })
    .skip(10 * page)
    .limit(10);
  let total = await shopNotification.find({ shopId: req.shopId }).count();

  return { notification, total: total };
};

const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { parse } = require('path');
ffmpeg.setFfmpegPath(ffmpegPath);
const get_stream_post_after_live_stream = async (req) => {
  let streamId = req.query.id;
  let streamnotification = await Streamrequest.findById(streamId);
  let notification = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: streamId } }] } },
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
                { $unwind: '$products' },
              ],
              as: 'streamposts',
            },
          },
          { $unwind: '$streamposts' },
          {
            $project: {
              _id: 1,
              images: '$streamposts.images',
              productId: '$streamposts.productId',
              categoryId: '$streamposts.categoryId',
              quantity: '$streamposts.quantity',
              marketPlace: '$streamposts.marketPlace',
              offerPrice: '$streamposts.offerPrice',
              postLiveStreamingPirce: '$streamposts.postLiveStreamingPirce',
              minLots: '$streamposts.minLots',
              incrementalLots: '$streamposts.incrementalLots',
              discription: '$streamposts.discription',
              location: '$streamposts.location',
              suppierId: '$streamposts.suppierId',
              DateIso: '$streamposts.DateIso',
              created: '$streamposts.created',
              video: '$streamposts.video',
              productTitle: '$streamposts.products.productTitle',
              streampostId: '$streamposts._id',
              uploadStreamVideo: '$streamposts.uploadStreamVideo',
              newVideoUpload: '$streamposts.newVideoUpload',
            },
          },
          // {
          //     $addFields: {
          //         productTitle: '$streamposts.products.productTitle',
          //     },
          // },
        ],
        as: 'streamrequestposts',
      },
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'CloudRecording' } }] } }],
        as: 'temptokens',
      },
    },
  ]);
  if (notification.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  let cloud_record = await tempTokenModel.findOne({ streamId: { $eq: streamId } });
  console.log(cloud_record, streamnotification);
  let value = notification[0];
  if (cloud_record) {
    console.log(cloud_record);
    // value.temptokens.forEach(async (e) => {
    if (cloud_record.convertStatus != 'Converted' && cloud_record.videoLink != null && cloud_record.videoLink != '') {
      const inputFilePath = 'https://streamingupload.s3.ap-south-1.amazonaws.com/' + cloud_record.videoLink;
      let store = cloud_record._id.replace(/[^a-zA-Z0-9]/g, '');
      const outputFilePath = 'output.mp4';

      ffmpeg(inputFilePath)
        .outputOptions('-c', 'copy')
        .output(outputFilePath)
        .on('end', (e) => {})
        .on('error', (err) => {
          console.error('Error while converting:', err);
        })
        .run();
      const s3 = new AWS.S3({
        accessKeyId: 'AKIA3323XNN7Y2RU77UG',
        secretAccessKey: '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',
        region: 'ap-south-1',
      });
      const bucketName = 'streamingupload';

      const fileContent = fs.readFileSync(outputFilePath);
      if (fileContent != null) {
        const params = {
          Bucket: bucketName,
          Key: store + '/mp4/' + outputFilePath,
          Body: fileContent,
        };
        s3.upload(params, async (err, data) => {
          if (err) {
            console.error(err);
          } else {
            cloud_record.convertedVideo = data.Location;
            cloud_record.convertedVideo = data.Location;
            cloud_record.convertStatus = 'Converted';
            cloud_record.save();
            // streamnotification.videoconvertStatus = 'Converted';
            // streamnotification.save();
            fs.unlink(outputFilePath, (err) => {
              if (err) {
              } else {
              }
            });
          }
        });
      }
    }
    // });
  }
  return value;
};

const update_start_end_time = async (req) => {
  let streamPostId = req.query.id;
  let streamPost = await StreamPost.findById(streamPostId);

  if (!streamPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  streamPost.streamStart = req.body.videoStart;
  streamPost.streamEnd = req.body.videoEnd;
  streamPost.newVideoUpload = 'time';
  // streamPost.save();

  return;
};

const video_upload_post = async (req) => {
  let streamPostId = req.query.id;
  let streamPost = await StreamPost.findById(streamPostId);
  if (!streamPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found post');
  }
  let store = streamPost._id.replace(/[^a-zA-Z0-9]/g, '');
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: 'NW7jfKJoom+Cu/Ys4ISrBvCU4n4bg9NsvzAbY07c',
    region: 'ap-south-1',
  });
  const fileBuffer = req.file.buffer;
  let params = {
    Bucket: 'streamingupload',
    Key: store + '/uploaded/' + req.file.originalname,
    Body: fileBuffer,
  };
  return new Promise((resolve) => {
    const s3Upload = s3.upload(params);

    s3Upload.on('httpUploadProgress', function (progress) {
      //console.log('Progress:', progress.loaded, '/', progress.total);
    });
    s3Upload.send(function (err, data) {
      if (err) {
        // //console.log('Error uploading file:', err);
      } else {
        //console.log('File uploaded successfully:', data.Location);
        streamPost.uploadStreamVideo = data.Location;
        streamPost.newVideoUpload = 'video';
        streamPost.save();
        resolve({ video: 'success', streamPost });
      }
    });
  });
};

const get_video_link = async (req) => {
  let streamId = req.query.id;
  let streamnotification = await Streamrequest.findById(streamId);
  const promises = [];
  const arr = [1, 2, 3, 4, 5];

  let notification = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: streamId } }] } },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [{ $match: { $and: [{ type: { $eq: 'CloudRecording' } }] } }],
        as: 'temptokens',
      },
    },
  ]);
  if (notification.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found stream');
  }
  let value = notification[0];
  value.temptokens.forEach(async (e) => {
    const promise = new Promise((resolve, reject) => {
      if (e.convertStatus != 'Converted') {
        const inputFilePath = 'https://streamingupload.s3.ap-south-1.amazonaws.com/' + e.videoLink;
        let store = e._id.replace(/[^a-zA-Z0-9]/g, '');
        const outputFilePath = 'output.mp4';

        ffmpeg(inputFilePath)
          .outputOptions('-c', 'copy')
          .output(outputFilePath)
          .on('end', (e) => {
            //console.log('Conversion completed successfully', e);
          })
          .on('error', (err) => {
            console.error('Error while converting:', err);
          })
          .run();
        const s3 = new AWS.S3({
          accessKeyId: 'AKIA3323XNN7Y2RU77UG',
          secretAccessKey: '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',
          region: 'ap-south-1',
        });
        const bucketName = 'streamingupload';

        //console.log(outputFilePath);

        const fileContent = fs.readFileSync(outputFilePath);
        //console.log(fileContent);
        if (fileContent != null) {
          const params = {
            Bucket: bucketName,
            Key: store + '/mp4/' + outputFilePath,
            Body: fileContent,
          };
          s3.upload(params, async (err, data) => {
            if (err) {
              console.error(err);
            } else {
              e.convertedVideo = data.Location;
              let val = await tempTokenModel.findById(e._id);
              val.convertedVideo = data.Location;
              val.convertStatus = 'Converted';
              val.save();
              streamnotification.videoconvertStatus = 'Converted';
              streamnotification.save();
              resolve(val);
              // fs.unlink(outputFilePath, (err) => {
              //   if (err) {
              //     //console.log('Error deleting file:', err);
              //   } else {
              //     //console.log('File deleted successfully!');
              //   }
              // });
            }
          });
        }
      } else {
        resolve(e);
      }
    });
    promises.push(promise);
  });

  return Promise.all(promises)
    .then((results) => {
      //console.log(results);
      notification[0].temptokens = results;
      return notification[0];
    })
    .catch((error) => {
      console.error(error);
    });
};

const get_order_details_by_stream = async (id, query) => {
  //console.log(query);
  let buyerSearch = { _id: { $ne: null } };

  if (query.Buyer) {
    if (query.Buyer != '') {
      buyerSearch = {
        $or: [{ name: { $regex: query.buyer, $options: 'i' } }, { orderId: { $regex: query.buyer, $options: 'i' } }],
      };
    }
  } else {
  }

  let values = await streamingOrder.aggregate([
    {
      $match: {
        streamId: id,
        orderStatus: { $in: ['processed', 'payment received', 'loaded'] },
      },
    },
    {
      $lookup: {
        from: 'streamingorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              status: 'approved',
            },
          },
        ],
        as: 'approved',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$shop',
      },
    },
    {
      $project: {
        _id: 1,
        orderStatus: 1,
        orderId: 1,
        DispathCount: { $size: '$approved' },
        Buyer: '$shop.SName',
      },
    },
  ]);
  return values;
};

const get_post_view = async (req) => {
  //console.log(req.query.id)
  let value = await StreamPost.aggregate([
    { $match: { $and: [{ _id: req.query.id }] } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $project: {
        _id: 1,
        pendingQTY: 1,
        images: 1,
        status: 1,
        marketPlace: 1,
        offerPrice: 1,
        bookingAmount: 1,
        postLiveStreamingPirce: 1,
        minLots: 1,
        incrementalLots: 1,
        discription: 1,
        location: 1,
        afterStreaming: 1,
        DateIso: 1,
        productTitle: '$products.productTitle',
        video: 1,
      },
    },
  ]);
  //console.log(value)

  return value[0];
};

module.exports = {
  create_Plans,
  create_Plans_addon,
  get_all_Plans_addon,
  get_all_Plans_normal,
  get_all_Plans_pagination,
  get_all_Plans,
  get_one_Plans,
  update_one_Plans,
  delete_one_Plans,
  create_post,
  get_all_Post,
  get_one_Post,
  update_one_Post,
  delete_one_Post,
  remove_one_post,
  create_teaser_upload,
  getStreaming_orders_By_orders,
  create_stream_one,
  find_and_update_one,
  create_stream_two,
  get_all_stream,
  get_one_stream,
  get_one_stream_assign_host,
  update_one_stream,
  delete_one_stream,
  create_stream_one_image,
  create_stream_one_video,
  get_one_stream_step_two,
  update_one_stream_two,
  update_one_stream_one,
  get_all_admin,
  update_approved,
  update_reject,
  get_all_streams,
  get_subhost_token,
  get_subhost_streams,
  cancel_stream,
  end_stream,
  get_all_Post_with_page_all,
  get_all_Post_with_page_live,
  get_all_Post_with_page_completed,
  get_all_Post_with_page_exhausted,
  get_all_Post_with_page_removed,
  get_all_Post_with_page_assigned,

  go_live_stream_host,
  get_watch_live_steams,
  get_watch_live_steams_admin_watch,
  get_watch_live_token,

  regisetr_strean_instrest,
  unregisetr_strean_instrest,
  go_live_stream_host_SUBHOST,
  get_all_Post_with_page,

  purchase_details,
  purchase_details_supplier,

  purchase_link_plan,
  purchase_link_plan_get,

  get_stream_post,
  get_stream_alert,
  allot_stream_subhost,
  get_cancel_stream,

  create_slab,
  get_by_slab,
  update_slab,
  getallslab,

  get_completed_stream_upcommming,
  get_completed_stream_live,
  get_completed_stream_completed,
  get_completed_stream_expired,
  get_completed_stream_removed,
  get_completed_stream_cancelled,
  get_completed_stream_byid,
  get_completed_stream_buyer,
  getStock_Manager,
  getPosted_Details_By_Stream,
  fetchStream_Details_ById,
  fetch_Stream_Ordered_Details,
  update_Status_For_StreamingOrders,
  fetch_streaming_Details_Approval,
  update_approval_Status,
  fetch_Stream_Details_For_Buyer,
  update_Joined_User_Status_For_Buyer,
  fetch_Stream_Product_Details,
  fetch_stream_Payment_Details,
  update_Multiple_approval_Status,
  update_productOrders,
  update_Multiple_productOrders,
  Fetch_Streaming_Details_By_buyer,
  getStreaming_orders_By_orders_for_pay,
  multipleCancel,
  getOrder_For_Account_Manager,
  getDetails,

  get_notification_count,
  get_notification_viewed,
  get_notification_getall,
  get_stream_post_after_live_stream,
  update_start_end_time,
  video_upload_post,
  get_video_link,
  get_watch_live_steams_upcoming,
  get_watch_live_steams_upcoming_byid,
  get_watch_live_steams_interested,
  get_watch_live_steams_completed,
  getall_homeage_streams,
  get_watch_live_steams_current,
  get_post_view,
  on_going_stream,
};
