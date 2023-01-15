const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const marketSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  MName: {
    type: String,
  },
  locality: {
    type: String,
  },
  Address1: {
    type: String,
  },
  Address2: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  LandMark: {
    type: String,
  },
  image: {
    type: Array,
  },
  mlongitude: {
    type: String,
  },
  mlatitude: {
    type: String,
  },
  Uid: {
    type: String,
  },
  userName: {
    type: String,
  },
  userNo: {
    type: Number,
  },
  status: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
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
  Strid: {
    type: String,
  },
});
const Market = mongoose.model('market', marketSchema);

// market Clone

const marketCloneSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  MName: {
    type: String,
  },
  address: {
    type: String,
  },
  Wardid: {
    type: String,
  },
  locality: {
    type: String,
  },
  Address1: {
    type: String,
  },
  Address2: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  LandMark: {
    type: String,
  },
  image: {
    type: Array,
  },
  mlongitude: {
    type: String,
  },
  mlatitude: {
    type: String,
  },
  Uid: {
    type: String,
  },
  userName: {
    type: String,
  },
  userNo: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  status: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
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
  Strid: {
    type: String,
  },
});

const MarketClone = mongoose.model('marketClone', marketCloneSchema);

const ShopsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  MName: {
    type: String,
  },
  SName: {
    type: String,
  },
  SType: {
    type: String,
  },
  SNo: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  ownname: {
    type: String,
  },
  image: {
    type: Array,
  },
  ownnum: {
    type: Number,
  },
  mlatitude: {
    type: String,
  },
  mlongitude: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  Uid: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  reason: {
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
});
const MarketShops = mongoose.model('marketShops', ShopsSchema);

// marketShopClone

const ShopsCloneSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  MName: {
    type: String,
  },
  SName: {
    type: String,
  },
  SType: {
    type: String,
  },
  SNo: {
    type: String,
  },
  mobile: {
    type: String,
  },
  ownname: {
    type: String,
  },
  image: {
    type: Array,
  },
  ownnum: {
    type: String,
  },
  mlatitude: {
    type: String,
  },
  mlongitude: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  Uid: {
    type: String,
  },
  status: {
    type: String,
  },
  reason: {
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
});
const MarketShopsClone = mongoose.model('marketShopsClone', ShopsCloneSchema);

module.exports = {
  Market,
  MarketShops,
  MarketClone,
  MarketShopsClone,
};
