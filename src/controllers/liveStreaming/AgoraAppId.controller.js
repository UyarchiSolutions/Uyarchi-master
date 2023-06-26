const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const AgoraAppId = require('../../services/liveStreaming/AgoraAppId.service');


const InsertAppId= catchAsync(async (req, res) => {
    const data = await AgoraAppId.InsertAppId(req);
    res.status(httpStatus.CREATED).send(data);
  });


module.exports = {
  InsertAppId
  };
  