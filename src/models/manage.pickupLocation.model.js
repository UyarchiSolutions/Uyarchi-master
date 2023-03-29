const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const managepickupLocationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  wardId: {
    type: String,
  },
  streetId: {
    type: String,
  },
  locationName: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  contact: {
    type: String,
  },
  address: {
    type: String,
  },
  landMark: {
    type: String,
  },
  photoCapture: {
    type: Array,
  },
  latitude: {
    type: Number,
  },
  langitude: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  pick_Up_Type: {
    type: String,
  },
  picku_Up_Mode: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  location: {
    type: Object,
    
  },
  color:{
    type: String,
  }

});
managepickupLocationSchema.index({ location: '2dsphere' });

const ManagePickupLocations = mongoose.model('ManagePickupLocations', managepickupLocationSchema);

module.exports = ManagePickupLocations;
