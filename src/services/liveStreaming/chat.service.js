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


const chat_room_create = async (req, io) => {
  // console.log(req)
  let dateIso = new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
  let stream = await Joinusers.findById(req.id)
  let user = await Shop.findById(stream.shopId)
  let data = await Groupchat.create({ ...req, ...{ created: moment(), dateISO: dateIso, userName: user.SName, userType: "buyer", shopId: stream.shopId, joinuser: req.id } })
  console.log(data)
  io.sockets.emit(req.channel, data);
}

const getoldchats = async (req) => {
  console.log(req)
  let data = await Groupchat.find({ channel: req.query.channel }).sort({ dateISO: 1 });
  return data;
}

const chat_room_create_subhost = async (req, io) => {
  // console.log(req)
  let dateIso = new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
  let token = await tempTokenModel.findById(req.id)
  let user = await Supplier.findById(token.supplierId)
  let data = await Groupchat.create({ ...req, ...{ created: moment(), dateISO: dateIso, userName: user.primaryContactName, userType: "supplier", supplierId: user._id, joinuser: req.id, user } })
  // console.log(req)
  io.sockets.emit(req.channel, data);
}


module.exports = {
  chat_room_create,
  getoldchats,
  chat_room_create_subhost
};
