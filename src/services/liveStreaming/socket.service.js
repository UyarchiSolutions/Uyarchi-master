const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { Groupchat } = require('../../models/liveStreaming/chat.model');
const { Shop } = require('../../models/b2b.ShopClone.model');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost } = require('../../models/ecomplan.model');
const Supplier = require('../../models/supplier.model');

const { tempTokenModel, Joinusers } = require('../../models/liveStreaming/generateToken.model');


const startStop_post = async (req, io) => {
  console.log(req)
  // // console.log(req)
  // let dateIso = new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
  // let stream = await Joinusers.findById(req.id)
  // let user = await Shop.findById(stream.shopId)
  // let data = await Groupchat.create({ ...req, ...{ created: moment(), dateISO: dateIso, userName: user.SName, userType: "buyer", shopId: stream.shopId, joinuser: req.id } })
  // // console.log(data)
  // io.sockets.emit(req.channel, data);
}

module.exports = {
  startStop_post
};
