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
    type: Date,
  },
  DateIso: {
    type: Number,
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
  streamvalidity: {
    type: Number,
    default: 30,
  },
  no_of_host: {
    type: Number,
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
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  quantity: {
    type: Number,
    default: 0
  },
  orderedQTY: {
    type: Number,
    default: 0
  },
  pendingQTY: {
    type: Number,
    default: 0
  },
  marketPlace: {
    type: Number,
  },
  offerPrice: {
    type: Number,
  },
  postLiveStreamingPirce: {
    type: Number,
  },
  validity: {
    type: Number,
  },
  DateIso: {
    type: Number,
  },
  minLots: {
    type: Number,
  },
  incrementalLots: {
    type: Number,
  },
  productId: {
    type: String,
  },
  categoryId: {
    type: String,
  },
  suppierId: {
    type: String,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  validityType: {
    type: String,
  },
  location: {
    type: String,
  },
  discription: {
    type: String,
  },
  images: {
    type: Array,
  },
  video: {
    type: String,
  },
  afterStreaming: {
    type: String,
  },
  streamStart: {
    type: Number,
  },
  streamEnd: {
    type: Number,
  },
  bookingAmount: {
    type: String,
  },
  status: {
    type: String,
    default: 'Active',
  },
  uploadStreamVideo:{
    type: String,
  },
  newVideoUpload:{
    type: String,
    default: 'Pending'
  }

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
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  suppierId: {
    type: String,
  },
  post: {
    type: Array,
  },
  communicationMode: {
    type: Array,
  },
  primarycommunication: {
    type: String,
  },
  secondarycommunication: {
    type: String,
  },
  streamingDate: {
    type: String,
  },
  streamingTime: {
    type: String,
  },
  streamingDate_time: {
    type: String,
  },
  image: {
    type: String,
  },
  teaser: {
    type: String,
  },
  postCount: {
    type: Number,
  },
  sepTwo: {
    type: String,
    default: 'Pending',
  },
  planId: {
    type: String,
  },
  streamName: {
    type: String,
  },
  discription: {
    type: String,
  },
  adminApprove: {
    type: String,
    default: 'Pending',
  },
  tokenDetails: {
    type: String,
  },
  activelive: {
    type: String,
    default: 'Pending',
  },
  tokenGeneration: {
    type: Boolean,
    default: false,
  },
  Duration: {
    type: Number,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },
  noOfParticipants: {
    type: Number,
  },
  chat: {
    type: String,
  },
  max_post_per_stream: {
    type: Number,
  },
  goLive: {
    type: Boolean,
    default: false,
  },
  // afterStreaming: {
  //   type: String,
  //   default: false,
  // }
  audio: {
    type: Boolean,
    default: false,
  },
  video: {
    type: Boolean,
    default: false,
  },
  chat_need: {
    type: String,
  },
  allot_chat: {
    type: String,
  },
  allot_host_1: {
    type: String,
  },
  allot_host_2: {
    type: String,
  },
  allot_host_3: {
    type: String,
  },
  allot: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
  },
  streamEnd_Time: {
    type: Number,
  },
  end_Status: {
    type: String,
  },
  videoconvertStatus: {
    type: String,
    default: "Pending"
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
    type: String,
  },
  streamRequest: {
    type: String,
  },
  created: {
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  suppierId: {
    type: String,
  },
  tokenDetails: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
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
    type: String,
  },
  shopId: {
    type: String,
  },
  created: {
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Registered',
  },
  streamCount: {
    type: Number,
  },
  eligible: {
    type: Boolean,
    default: false,
  },
  viewstatus: {
    type: String,
  },
});

const StreamPreRegister = mongoose.model('streampreregister', streamPreRegister);

const streamPlanlinkschema = mongoose.Schema({
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
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  status: {
    type: String,
    default: 'created',
  },
  supplier: {
    type: String,
  },
  plan: {
    type: String,
  },
  expireMinutes: {
    type: Number,
  },
  token: {
    type: String,
  },
  expireTime: {
    type: Number,
  },
  purchaseId: {
    type: String,
  },
});

const streamPlanlink = mongoose.model('streamplanlink', streamPlanlinkschema);

const Slabschema = mongoose.Schema({
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
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  status: {
    type: String,
    default: 'created',
  },
  formAmount: {
    type: Number,
  },
  endAmount: {
    type: Number,
  },
  slabPercentage: {
    type: Number,
  },
});

const Slab = mongoose.model('slabdetails', Slabschema);


const shopNotificationschema = mongoose.Schema({
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
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  status: {
    type: String,
    default: 'created',
  },
  type: {
    type: String,
  },
  shopId: {
    type: String,
  },
  streamId: {
    type: String,
  },
  streamName: {
    type: String,
  },
  streamRegister: {
    type: String,
  },
  streamObject: {
    type: Object,
  },
  streamRegisterobject: {
    type: Object,
  },
  title: {
    type: String,
  },
});

const shopNotification = mongoose.model('shopNotification', shopNotificationschema);


module.exports = { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister, streamPlanlink, Slab, shopNotification };
