const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { tempTokenModel, Joinusers } = require('../../models/liveStreaming/generateToken.model');
const axios = require('axios'); //
const appID = '1ba2592b16b74f3497e232e1b01f66b0';
const appCertificate = '8ae85f97802448c2a47b98715ff90ffb';
const Authorization = `Basic ${Buffer.from(`61b817e750214d58ba9d8148e7c89a1b:88401de254b2436a9da15b2f872937de`).toString(
  'base64'
)}`;
const Dates = require('../Date.serive')

const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister } = require('../../models/ecomplan.model');
const { request } = require('express');


const generateUid = async (req) => {
  const length = 5;
  const randomNo = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  return randomNo;
};

const generateToken = async (req) => {
  let supplierId = req.userId;
  let streamId = req.body.streamId;
  console.log(streamId)
  let stream = await Streamrequest.findById(streamId)
  if (!streamId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  const expirationTimeInSeconds = 3600;
  const uid = await generateUid();
  const uid_cloud = await generateUid();
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const moment_curr = moment(stream.startTime);
  const currentTimestamp = moment_curr.add(stream.Duration, 'minutes');
  const expirationTimestamp = stream.endTime / 1000;
  let value = await tempTokenModel.create({
    ...req.body,
    ...{
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HHMMSS'),
      supplierId: supplierId,
      streamId: streamId,
      created: moment(),
      Uid: uid,
      participents: 3,
      created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
      expDate: expirationTimestamp * 1000,
      Duration: stream.Duration
    },
  });
  const token = await geenerate_rtc_token(streamId, uid, role, expirationTimestamp);
  value.token = token;
  value.chennel = streamId;
  value.store = value._id.replace(/[^a-zA-Z0-9]/g, '');
  let cloud_recording = await generateToken_sub_record(streamId, false, req, value, expirationTimestamp);
  value.cloud_recording = cloud_recording.value.token;
  value.uid_cloud = cloud_recording.value.Uid;
  value.cloud_id = cloud_recording.value._id;
  value.save();
  stream.tokenDetails = value._id;
  stream.tokenGeneration = true;
  stream.goLive = true;
  stream.save();
  req.io.emit(streamId + "_golive", { streamId: streamId, })
  return { uid, token, value, cloud_recording, stream };
};
const geenerate_rtc_token = async (chennel, uid, role, expirationTimestamp) => {
  return Agora.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, chennel, uid, role, expirationTimestamp);
};
const generateToken_sub_record = async (channel, isPublisher, req, hostIdss, expire) => {
  const expirationTimeInSeconds = 3600;
  const uid = await generateUid();
  const role = isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  console.log(role);
  const moment_curr = moment();
  const currentTimestamp = moment_curr.add(600, 'minutes');
  const expirationTimestamp =
    new Date(new Date(currentTimestamp.format('YYYY-MM-DD') + ' ' + currentTimestamp.format('HH:mm:ss'))).getTime() / 1000;
  let value = await tempTokenModel.create({
    ...req.body,
    ...{
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HHMMSS'),
      created: moment(),
      Uid: uid,
      chennel: channel,
      participents: 3,
      created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
      expDate: expirationTimestamp * 1000,
      type: 'subhost',
      hostId: hostIdss._id
    },
  });
  console.log(role);
  const token = await geenerate_rtc_token(channel, uid, role, expirationTimestamp);
  value.token = token;
  value.save();
  return { uid, token, value };
};

const generateToken_sub = async (req) => {
  const channel = req.query.id;
  let str = await Streamrequest.findById(channel)
  let users = await Joinusers.find({ streamId: channel }).count()
  console.log(users, str.noOfParticipants)
  let user = await Joinusers.findOne({ streamId: channel, shopId: req.shopId, })
  if (!user) {
    user = await Joinusers.create({ shopId: req.shopId, streamId: channel, hostId: str.tokenDetails });
    await Dates.create_date(user);
  }
  let stream = await tempTokenModel.findOne({ streamId: channel, type: "sub", hostId: { $ne: null }, shopId: req.shopId });
  if (!stream) {
    const uid = await generateUid();
    const role = Agora.RtcRole.SUBSCRIBER;

    const moment_curr = moment();
    const currentTimestamp = moment_curr.add(600, 'minutes');
    const expirationTimestamp =
      new Date(new Date(currentTimestamp.format('YYYY-MM-DD') + ' ' + currentTimestamp.format('HH:mm:ss'))).getTime() / 1000;
    let value = await tempTokenModel.create({
      ...req.body,
      ...{
        hostId: str.tokenDetails,
        type: 'sub',
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        created: moment(),
        Uid: uid,
        chennel: channel,
        participents: 3,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: str.endTime,
        shopId: req.shopId,
        streamId: channel,
        joinedUser: user._id

      },
    });
    const token = await geenerate_rtc_token(channel, uid, role, str.endTime / 1000);
    value.token = token;
    value.save();
    stream = value;
  }
  await Joinusers.findByIdAndUpdate({ _id: user._id }, { latestedToken: stream._id, token: stream._id }, { new: true })
  await get_participents_limit(req)
  // return user
  return { stream: stream, user: user };
  // }
  // else {
  //   let user = await Joinusers.findOne({ token: stream._id, shopId: req.shopId, });
  //   if (!user) {
  //     throw new ApiError(httpStatus.NOT_FOUND, 'Max participants Reached');
  //   }
  //   await get_participents_limit(req)
  //   return { stream: stream, user: user };
  // }
};

const getHostTokens = async (req) => {
  let time = new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
  let value = await tempTokenModel.aggregate([
    {
      $sort: {
        created: -1,
      },
    },
    {
      $match: {
        $and: [{ expDate: { $gte: time - 60 } }, { type: { $eq: 'host' } }],
      },
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'hostId',
        pipeline: [
          {
            $match: {
              $and: [{ active: { $eq: true } }],
            },
          },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
        as: 'active_users',
      },
    },
    {
      $unwind: {
        path: '$active_users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'hostId',
        pipeline: [
          {
            $match: {
              $and: [{ active: { $eq: false } }],
            },
          },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
        as: 'total_users',
      },
    },
    {
      $unwind: {
        path: '$total_users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        type: 1,
        date: 1,
        Uid: 1,
        chennel: 1,
        participents: 1,
        created_num: 1,
        expDate: 1,
        created: 1,
        active_users: { $ifNull: ['$active_users.count', 0] },
        In_active_users: { $ifNull: ['$total_users.count', 0] },
        total_user: { $sum: ['$total_users.count', '$active_users.count'] },
        active: 1,
      },
    },
  ]);
  return value;
};

const gettokenById = async (req) => {
  let value = await tempTokenModel.findById(req.id);
  return value;
};
const gettokenById_host = async (req) => {
  let value = await tempTokenModel.findById(req.id);
  // const uid = await generateUid();
  // const role = Agora.RtcRole.PUBLISHER;
  // const token = await geenerate_rtc_token(value.chennel, uid, role, value.expDate / 1000);
  // value.token = token;
  // value.Uid = uid;
  // value.save();
  // console.log(role);
  return value;
};
const leave_participents = async (req) => {
  let value = await tempTokenModel.findByIdAndUpdate({ _id: req.query.id }, { active: false }, { new: true });
  return value;
};

const leave_host = async (req) => {
  let value = await tempTokenModel.findByIdAndUpdate({ _id: req.id }, { active: false }, { new: true });
  return value;
};
const join_host = async (req) => {
  let value = await tempTokenModel.findByIdAndUpdate({ _id: req.id }, { active: true }, { new: true });
  return value;
};

const participents_limit = async (req) => {
  let participents = await tempTokenModel.findById(req.id);
  let value = await tempTokenModel.find({ hostId: req.id, active: true }).count();
  return { participents: value >= participents.participents ? false : true };
};

const agora_acquire = async (req) => {
  let token = await tempTokenModel.findById(req.body.id);
  console.log(token)
  console.log(token.chennel);
  console.log(token.Uid);
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
    {
      cname: token.chennel,
      uid: token.Uid.toString(),
      clientRequest: {
        resourceExpiredHour: 24,
        scene: 0,
      },
    },
    { headers: { Authorization } }
  );
  token.resourceId = acquire.data.resourceId;
  token.recoredStart = "acquire";
  token.save();
  return acquire.data;
};

const recording_start = async (req) => {
  let token = await tempTokenModel.findById(req.body.id);
  const resource = token.resourceId;
  console.log(resource)
  console.log(token)
  const mode = 'mix';
  const start = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
    {
      cname: token.chennel,
      uid: token.Uid.toString(),
      clientRequest: {
        token: token.token,
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2,
          channelType: 1,
          videoStreamType: 0,
          transcodingConfig: {
            height: 640,
            width: 1080,
            bitrate: 1000,
            fps: 15,
            mixedVideoLayout: 1,
            backgroundColor: '#FFFFFF',
          },
        },
        recordingFileConfig: {
          avFileType: ['hls'],
        },
        storageConfig: {
          vendor: 1,
          region: 14,
          bucket: 'streamingupload',
          accessKey: 'AKIA3323XNN7Y2RU77UG',
          secretKey: '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',
          fileNamePrefix: [token.store, token.Uid.toString()],
        },
      },
    },
    { headers: { Authorization } }
  );
  token.resourceId = start.data.resourceId;
  token.sid = start.data.sid;
  token.recoredStart = "start";
  token.save();
  return start.data;
};
const recording_query = async (req) => {
  console.log(req.body);
  let token = await tempTokenModel.findById(req.body.id);
  const resource = token.resourceId;
  const sid = token.sid;
  const mode = 'mix';
  console.log(`https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`);
  const query = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  );
  token.videoLink = query.data.serverResponse.fileList;
  token.recoredStart = "query";
  token.save();
  return query.data;
};
const recording_stop = async (req) => {

  const mode = 'mix';
  let token = await tempTokenModel.findById(req.body.id);
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
  token.recoredStart = "stop";
  token.save();
  return stop.data;
};
const recording_updateLayout = async (req) => {
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
    {
      cname: 'test',
      uid: '16261',
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  return acquire.data;
};

const chat_rooms = async (req) => {
  let value = await tempTokenModel.findById(req.id);
  return value;
};

const get_sub_token = async (req) => {
  let value = await tempTokenModel.aggregate([
    { $match: { $and: [{ _id: { $eq: req.id } }] } },
    {
      $lookup: {
        from: 'temptokens',
        localField: 'hostId',
        foreignField: '_id',
        as: 'active_users',
      },
    },
    { $unwind: "$active_users" },
    {
      $project: {
        _id: 1,
        active: 1,
        archived: 1,
        hostId: 1,
        type: 1,
        date: 1,
        time: 1,
        created: 1,
        Uid: 1,
        chennel: 1,
        participents: 1,
        created_num: 1,
        expDate: 1,
        token: 1,
        hostUid: "$active_users.Uid",
        expDate_host: "$active_users.expDate",

      }
    }
  ])
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'plan_not_found');
  }
  return value[0];
};

const get_sub_golive = async (req) => {
  console.log(req.query.id)
  let value = await Joinusers.aggregate([
    { $match: { $and: [{ _id: { $eq: req.query.id } }, { shopId: { $eq: req.shopId } }] } },
    {
      $lookup: {
        from: 'temptokens',
        localField: 'latestedToken',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'temptokens',
              localField: 'hostId',
              foreignField: '_id',
              as: 'active_users',
            },
          },
          // { $unwind: "$active_users" },
          {
            $project: {
              active: 1,
              archived: 1,
              hostId: 1,
              type: 1,
              date: 1,
              time: 1,
              created: 1,
              Uid: 1,
              chennel: 1,
              participents: 1,
              created_num: 1,
              expDate: 1,
              token: 1,
              // hostUid: "$active_users.Uid",
              // expDate_host: "$active_users.expDate",
              // active_users: "$active_users"
            }
          }
        ],
        as: 'temptokens',
      },
    },
    { $unwind: "$temptokens" },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'purchasedplans',
              localField: 'planId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'streamplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'streamplans',
                  },
                },
                { $unwind: "$streamplans" },
              ],
              as: 'purchasedplans',
            },
          },
          { $unwind: "$purchasedplans" },

        ],
        as: 'streamrequests',
      },
    },
    { $unwind: "$streamrequests" },
    {
      $lookup: {
        from: 'streamrequests',
        localField: 'streamId',
        foreignField: '_id',
        pipeline: [
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
                    ],
                    as: 'streamposts',
                  },
                },
                { $unwind: "$streamposts" },
                {
                  $project: {
                    _id: 1,
                    "active": 1,
                    "archive": 1,
                    "productId": "$streamposts.productId",
                    "productTitle": "$streamposts.products.productTitle",
                    "image": "$streamposts.products.image",
                    "categoryId": "a7c95af4-abd5-4fe0-b685-fd93bb98f5ec",
                    "quantity": "$streamposts.quantity",
                    "marketPlace": "$streamposts.marketPlace",
                    "offerPrice": "$streamposts.offerPrice",
                    "postLiveStreamingPirce": "$streamposts.postLiveStreamingPirce",
                    "validity": "$streamposts.validity",
                    "minLots": "$streamposts.minLots",
                    "incrementalLots": "$streamposts.incrementalLots",
                    bookingAmount: "$streamposts.bookingAmount",
                    "suppierId": 1,
                    "DateIso": 1,
                    "created": "2023-01-20T11:46:58.201Z",

                  }
                }
              ],
              as: 'streamrequestposts',
            },
          },
        ],
        as: 'streamrequests_post',
      },
    },
    { $unwind: "$streamrequests_post" },
    {
      $project: {
        _id: 1,
        active: "$temptokens.active",
        archived: "$temptokens.archived",
        hostId: "$temptokens.hostId",
        type: "$temptokens.type",
        date: "$temptokens.date",
        time: "$temptokens.time",
        created: "$temptokens.created",
        Uid: "$temptokens.Uid",
        chennel: "$temptokens.chennel",
        participents: "$temptokens.participents",
        created_num: "$temptokens.created_num",
        expDate: "$temptokens.expDate",
        token: "$temptokens.token",
        hostUid: "$temptokens.hostUid",
        expDate_host: "$temptokens.expDate_host",
        temptokens: "$temptokens",
        streamrequests: "$streamrequests",
        chat: "$streamrequests.purchasedplans.streamplans.chatNeed",
        streamrequests_post: "$streamrequests_post",
        streamrequestposts: "$streamrequests_post.streamrequestposts",
        chat_need: "$streamrequests.chat_need"

      }
    }
  ])
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'plan_not_found');
  }
  return value[0];
};

const get_participents_limit = async (req) => {
  let result = await find_userLimt(req.query.id)
  req.io.emit(req.query.id + "_count", result)

  return result
};
const find_userLimt = async (channel) => {
  const user = await StreamPreRegister.find({ streamId: channel, status: "Registered" }).count()
  const stream = await Streamrequest.findById(channel)
  return { userActive: user, noOfParticipants: stream.noOfParticipants };
};

const remove_host_live = async (req) => {
  req.io.emit(req.query.id + "admin_action", { remove: true });
  return { removed: "success" }
};

const create_subhost_token = async (req) => {
  let supplierId = req.subhostId;
  let streamId = req.body.streamId;
  console.log(streamId)
  let stream = await Streamrequest.findById(streamId)
  let value = await tempTokenModel.findOne({ streamId: stream._id, supplierId: supplierId });
  if (!value) {
    if (!streamId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    const uid = await generateUid();
    const expirationTimestamp = stream.endTime / 1000;
    value = await tempTokenModel.create({
      ...req.body,
      ...{
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        supplierId: supplierId,
        streamId: streamId,
        created: moment(),
        Uid: uid,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        Duration: stream.Duration,
        type: 'subhost',
      },
    });
    const token = await geenerate_rtc_token(streamId, uid, Agora.RtcRole.PUBLISHER, expirationTimestamp);
    value.token = token;
    value.chennel = streamId;
    value.save();
    stream.tokenGeneration = true;
    stream.goLive = true;
    stream.save();
  }
  req.io.emit(streamId + "_golive", { streamId: streamId, });
  return value;
};

const create_raice_token = async (req) => {
  let streamId = req.body.streamId;
  console.log(streamId)
  let stream = await Streamrequest.findById(streamId)
  let value = await tempTokenModel.findOne({ streamId: stream._id, type: 'raice-your-hand', });
  if (!value) {
    if (!streamId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    const uid = await generateUid();
    const expirationTimestamp = stream.endTime / 1000;
    value = await tempTokenModel.create({
      ...req.body,
      ...{
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        streamId: streamId,
        created: moment(),
        Uid: uid,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        Duration: stream.Duration,
        type: 'raice-your-hand',
      },
    });
    const token = await geenerate_rtc_token(streamId, uid, Agora.RtcRole.PUBLISHER, expirationTimestamp);
    value.token = token;
    value.chennel = streamId;
    value.store = value._id.replace(/[^a-zA-Z0-9]/g, '');
    value.save();
  }

  return value;
};


const production_supplier_token = async (req) => {
  let supplierId = req.userId;
  let streamId = req.body.streamId;
  let stream = await Streamrequest.findById(streamId)
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  value = await tempTokenModel.findOne({ supplierId: supplierId, chennel: streamId });
  console.log(value)
  if (!value) {
    const uid = await generateUid();
    const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
    const expirationTimestamp = stream.endTime / 1000;
    value = await tempTokenModel.create({
      ...req.body,
      ...{
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        supplierId: supplierId,
        streamId: streamId,
        created: moment(),
        Uid: uid,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        Duration: stream.Durationm,
        type: "Supplier"
      },
    });
    const token = await geenerate_rtc_token(streamId, uid, role, expirationTimestamp);
    value.token = token;
    value.chennel = streamId;
    value.save();
    stream.tokenGeneration = true;
    stream.goLive = true;
    stream.save();
  }
  req.io.emit(streamId + "_golive", { streamId: streamId, })
  return value;
};

const production_supplier_token_cloudrecording = async (req) => {
  let streamId = req.body.streamId;
  let stream = await Streamrequest.findById(streamId)
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  value = await tempTokenModel.findOne({ chennel: streamId, type: 'CloudRecording', recoredStart: { $ne: "stop" } });
  if (!value) {
    const uid = await generateUid();
    const role = Agora.RtcRole.SUBSCRIBER;
    const expirationTimestamp = stream.endTime / 1000;
    value = await tempTokenModel.create({
      ...req.body,
      ...{
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        created: moment(),
        Uid: uid,
        chennel: stream._id,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        type: 'CloudRecording',
      },
    });
    const token = await geenerate_rtc_token(stream._id, uid, role, expirationTimestamp);
    value.token = token;
    value.store = value._id.replace(/[^a-zA-Z0-9]/g, '');
    value.save();
  }
  return value
}

const production_supplier_token_watchamin = async (req) => {
  let streamId = req.body.streamId;
  let stream = await Streamrequest.findById(streamId)
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  value = await tempTokenModel.findOne({ chennel: streamId, type: 'adminwatch', });
  if (!value) {
    const uid = await generateUid();
    const role = Agora.RtcRole.SUBSCRIBER;
    const expirationTimestamp = stream.endTime / 1000;
    value = await tempTokenModel.create({
      ...req.body,
      ...{
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        created: moment(),
        Uid: uid,
        chennel: stream._id,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        type: 'adminwatch',
      },
    });
    const token = await geenerate_rtc_token(stream._id, uid, role, expirationTimestamp);
    value.token = token;
    value.save();
  }
  return value
}


const get_stream_complete_videos = async (req) => {
  let streamId = req.query.id;
  let value = await Streamrequest.aggregate([
    { $match: { $and: [{ _id: { $eq: streamId } }] } },
    {
      $lookup: {
        from: 'temptokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $eq: "CloudRecording" } }, { $or: [{ recoredStart: { $eq: "stop" } }, { recoredStart: { $eq: "query" } }] }],
            },
          },
        ],
        as: 'temptokens',
      },
    },
  ])
  if (value.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }

  return value[0];

}

module.exports = {
  generateToken,
  getHostTokens,
  gettokenById,
  participents_limit,
  leave_participents,
  leave_host,
  join_host,
  agora_acquire,
  recording_start,
  recording_query,
  recording_stop,
  recording_updateLayout,
  generateToken_sub,
  gettokenById_host,
  chat_rooms,
  get_sub_token,
  get_sub_golive,
  get_participents_limit,
  remove_host_live,
  create_subhost_token,
  create_raice_token,
  production_supplier_token,
  production_supplier_token_cloudrecording,
  production_supplier_token_watchamin,
  get_stream_complete_videos
};
