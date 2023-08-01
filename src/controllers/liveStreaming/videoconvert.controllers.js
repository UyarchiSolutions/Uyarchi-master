const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const generateTokenService = require('../../services/liveStreaming/videoconvert.service');


const video_convert_now = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.video_convert_now(req);
  res.status(httpStatus.CREATED).send(tokens);
});



module.exports = {
    video_convert_now

}