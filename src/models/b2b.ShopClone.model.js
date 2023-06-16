const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');

//shop clone Schema

const shopSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Strid: {
    type: String,
  },
  Wardid: {
    type: String,
  },
  SType: {
    type: String,
  },
  address: {
    type: String,
  },
  shopNo: {
    type: String,
  },
  SName: {
    type: String,
  },
  SOwner: {
    type: String,
  },
  mobile: {
    type: String,
  },
  Slat: {
    type: String,
  },
  Slong: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  Uid: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },

  editStatus: {
    type: String,
    default: 'Pending',
  },
  changeMap: {
    type: Boolean,
    default: false,
  },
  chLat: {
    type: String,
  },
  chLong: {
    type: String,
  },
  dummySort: {
    type: Number,
  },
  whatsappnumber: {
    type: Number,
  },
  alternatenumber: {
    type: Number,
  },
  kyc_status: {
    type: String,
    default: 'Pending',
  },
  reason: {
    type: String,
  },
  date: {
    type: String,
  },
  filterDate: {
    type: String,
  },
  time: {
    type: Number,
  },
  created: {
    type: String,
  },
  callingStatus: {
    type: String,
    default: 'Pending',
  },
  callingStatusSort: {
    type: Number,
    default: 1,
  },
  callingUserId: {
    type: String,
  },
  sortdate: {
    type: String,
  },
  sorttime: {
    type: Number,
  },
  marketId: {
    type: String,
  },
  historydate: {
    type: String,
  },
  shopNo: {
    type: String,
  },
  shopMobile: {
    type: String,
  },
  secondShop: {
    type: String,
    default: 'false',
  },
  CallStatus: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
  },
  type: {
    type: String,
  },
  salesManStatus: {
    type: String,
  },
  telecallerStatus: {
    type: String,
  },
  registered: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  },
  lapsedOrder: {
    type: String,
  },
  purchaseQTy: {
    type: String,
  },
  DA_Comment: {
    type: String,
  },
  daStatus: {
    type: String,
  },
  da_lot: {
    type: Number,
  },
  da_long: {
    type: Number,
  },
  DA_DATE: {
    type: String,
  },
  DA_USER: {
    type: String,
  },
  DA_CREATED: {
    type: Date,
  },
  DA_TIME: {
    type: Number,
  },
  da_landmark: {
    type: String,
  },
  Pincode: {
    type: Number,
  },
  salesmanOrderStatus: {
    type: String,
  },
  gomap: {
    type: Date,
  },
  distance: {
    type: String,
  },
  da_distance: {
    type: String,
  },
  distanceStatus: {
    type: String,
  },

  Re_DA_Comment: {
    type: String,
  },
  Re_daStatus: {
    type: String,
  },
  Re_da_lot: {
    type: Number,
  },
  Re_da_long: {
    type: Number,
  },
  Re_DA_DATE: {
    type: String,
  },
  Re_DA_USER: {
    type: String,
  },
  Re_DA_CREATED: {
    type: Date,
  },
  Re_DA_TIME: {
    type: Number,
  },
  Re_da_landmark: {
    type: String,
  },
  Re_Pincode: {
    type: Number,
  },
  Re_purchaseQTy: {
    type: String,
  },
  re_Uid: {
    type: String,
  },
  reAssigin_date: {
    type: String,
  },
  sort_wde: {
    type: Number,
  },
  location: {
    type: Object,
  },
  location_add: {
    type: Object,
  },
  email: {
    type: String,
  },
  new_re_approve: {
    type: String,
  },
  new_re_lat: {
    type: Number,
  },
  new_re_long: {
    type: Number,
  },
  customer_final_date: {
    type: String,
  },
  customer_final_USER: {
    type: String,
  },
  customer_final_CREATED: {
    type: Date,
  },
  customer_final_TIME: {
    type: Number,
  },
  editeStatus: { type: String, default: 'Pending' },
});

// assignSchema.plugin(toJSON);
// assignSchema.plugin(paginate);
// shopSchema.index({ location_add: '2dsphere' });

shopSchema.plugin(toJSON);
shopSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
shopSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
shopSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

shopSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
shopSchema.index({ location: '2dsphere' });
const Shop = mongoose.model('B2BshopClone', shopSchema);

const attendanceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Alat: {
    type: String,
  },
  Along: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  Uid: {
    type: String,
  },
  wardId: {
    type: String,
  },
  created: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  type: {
    type: String,
  },

  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
});
const AttendanceClone = mongoose.model('AttendanceClone', attendanceSchema);

const attendanceSchemaclone = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Alat: {
    type: String,
  },
  Along: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  Uid: {
    type: String,
  },
  wardId: {
    type: String,
  },
  created: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  type: {
    type: String,
  },

  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
});

const AttendanceClonenew = mongoose.model('AttendanceClonenew', attendanceSchemaclone);

module.exports = { Shop, AttendanceClone, AttendanceClonenew };
