const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const streamplanschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date
  },
  DateIso: {
    type: Number
  },
  planName: {
    type: String,
  },
  Duration: {
    type: Number,
  },
  DurationType: {
    type: String,
  },
  numberOfParticipants: {
    type: Number,
  },
  numberofStream: {
    type: Number,
  },
  validityofplan: {
    type: Number,
  },
  additionalDuration: {
    type: String,
  },
  additionalParticipants: {
    type: String,
  },
  DurationIncrementCost: {
    type: Number,
  },
  noOfParticipantsCost: {
    type: Number,
  },
  chatNeed: {
    type: String,
  },
  commision: {
    type: String,
  },
  commition_value: {
    type: Number,
  },
  stream_expire_hours: {
    type: Number,
  },
  stream_expire_days: {
    type: Number,
  },
  stream_expire_minutes: {
    type: Number,
  },
  regularPrice: {
    type: Number,
  },
  salesPrice: {
    type: Number,
  },
  max_post_per_stream: {
    type: Number,
  },
  planType: {
    type: String,
  },
  description: {
    type: String,
  },
  planmode: {
    type: String,
  },
});

const Streamplan = mongoose.model('streamplan', streamplanschema);

const streamPostschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date
  },
  DateIso: {
    type: Number
  },
  quantity: {
    type: Number
  },
  marketPlace: {
    type: Number
  },
  offerPrice: {
    type: Number
  },
  postLiveStreamingPirce: {
    type: Number
  },
  validity: {
    type: Number
  }, DateIso: {
    type: Number
  },
  minLots: {
    type: Number
  },
  incrementalLots: {
    type: Number
  },
  productId: {
    type: String
  },
  categoryId: {
    type: String
  },
  suppierId: {
    type: String
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  validityType: {
    type: String
  },
  location: {
    type: String
  },
  discription: {
    type: String
  },

});

const StreamPost = mongoose.model('Streampost', streamPostschema);



const streamRequestschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date
  },
  DateIso: {
    type: Number
  },
  quantity: {
    type: Number
  },
  suppierId: {
    type: String
  },
  post: {
    type: Array
  },
  bookingAmount: {
    type: Number
  },
  bookingAmount_contion: {
    type: String
  },
  communicationMode: {
    type: Array
  },
  primarycommunication: {
    type: String
  },
  secondarycommunication: {
    type: String
  },
  streamingDate: {
    type: String
  },
  streamingTime: {
    type: String
  },
  image: {
    type: String
  },
  video: {
    type: String
  },
  postCount: {
    type: Number
  },
  sepTwo: {
    type: String,
    default: 'Pending'
  },
  planId: {
    type: String
  },
  streamName: {
    type: String
  },
  discription: {
    type: String
  },
  adminApprove: {
    type: String,
    default: "Pending"
  },
  tokenDetails: {
    type: String
  },
  activelive: {
    type: String,
    default: "Pending"
  },
  tokenGeneration: {
    type: Boolean,
    default: false,
  },
  Duration: {
    type: Number
  },
  startTime: {
    type: Number
  },
  endTime: {
    type: Number
  },
  noOfParticipants: {
    type: Number
  },
  chat: {
    type: String
  },
  max_post_per_stream: {
    type: Number
  },
  goLive: {
    type: Boolean,
    default: false,
  },
  afterStreaming: {
    type: String,
    default: false,


  }



});

const Streamrequest = mongoose.model('StreamRequest', streamRequestschema);


const streamRequestschema_post = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  postId: {
    type: String
  },
  streamRequest: {
    type: String
  },
  created: {
    type: Date
  },
  DateIso: {
    type: Number
  },
  suppierId: {
    type: String
  },
  tokenDetails: {
    type: String
  },
});

const StreamrequestPost = mongoose.model('StreamRequestpost', streamRequestschema_post);



const streamPreRegister = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  streamId: {
    type: String
  },
  shopId: {
    type: String
  },
  created: {
    type: Date
  },
  DateIso: {
    type: Number
  },
  status: {
    type: String,
    default: "Registered"
  },
  streamCount: {
    type: Number,
  },
  eligible: {
    type: Boolean,
    default: false,
  }
});

const StreamPreRegister = mongoose.model('streampreregister', streamPreRegister);

module.exports = { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister };

