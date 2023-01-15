const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { Groupchat } = require('../../models/liveStreaming/chat.model');
const { Shop } = require('../../models/b2b.ShopClone.model');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost } = require('../../models/ecomplan.model');

const { tempTokenModel } = require('../../models/liveStreaming/generateToken.model');


const chat_room_create = async (req,io) => {
    let dateIso= new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
    let stream=await tempTokenModel.findById(req.id)
    let user=await Shop.findById(stream.shopId)
    let data=await Groupchat.create({...req,...{created:moment(),dateISO:dateIso,userName:user.SName,userType:"buyer",shopId:req.id}})
    io.sockets.emit(req.channel, data);
}

const getoldchats=async (req) => {
    console.log(req)
    let data=await Groupchat.find({channel:req.query.channel}).sort({dateISO:1});
    return data;
}

module.exports = {
  chat_room_create,
  getoldchats
};
