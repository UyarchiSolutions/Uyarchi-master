const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const { AgoraAppId } = require('../../models/liveStreaming/AgoraAppId.model');


const InsertAppId = async (req) => {

  let body = req.body;

  let authorization = req.body.cloud_KEY + ":" + req.body.cloud_secret
  body = { ...body, ...{ Authorization: authorization } }
  let appId = await AgoraAppId.create(body);

  return appId;

}
module.exports = {
  InsertAppId,
};
