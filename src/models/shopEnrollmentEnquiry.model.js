const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');
let date = moment().format('YYYY-MM-DD');
const shopEnrollmentEnquirySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
    default:moment().format('YYYY-MM-DD'),
  },
  time: {
    type: String,
    default:moment().format('h:mm a'),
  },
  shopType: {
    type: String,
  },
  shopName: {
    type: String,
  },
  mobileNumber: {
    type: Number,
  },
  area: {
    type: String,
  },
  contactName:{
    type:String,
  },
  pincode:{
    type:Number,
  },
  assignedTo:{
    type:String,
  },
  status:{
    type:String,
    default:"Pending"
  },
  uid:{
    type:String,
  },
  enquiryType:{
    type:String,
  },
  b2bshopcloneId:{
    type:String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
  );

const ShopEnrollmentEnquiry = mongoose.model('enrollmentEnquiryShop', shopEnrollmentEnquirySchema);


const shopEnrollmentEnquiryAssignSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    date: {
      type: String,
      default:moment().format('YYYY-MM-DD'),
    },
    time: {
      type: String,
      default:moment().format('h:mm a'),
    },
    shopId: {
      type: String,
    },
    status:{
      type:String,
    },
    assignTo:{
      type:String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
    {
      timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
    }
    );
  
  const ShopEnrollmentEnquiryAssign = mongoose.model('shopEnrollmentEnquiryAssign', shopEnrollmentEnquiryAssignSchema);

  const supplierEnrollmentSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    date: {
      type: String,
      default:moment().format('YYYY-MM-DD'),
    },
    time: {
      type: String,
      default:moment().format('h:mm a'),
    },
    tradeName: {
      type: String,
    },
    suplierName:{
      type:String,
    },
    mobileNumber:{
      type:Number,
    },
    Area:{
      type:String,
    },
    productDealingwith:{
      type:Array,
    },
    createdBy:{
      type:String,
    },
    status:{
      type:String,
      default:"Pending"
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
    {
      timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
    }
    );
  
  const SupplierEnrollment = mongoose.model('supplierEnrollment', supplierEnrollmentSchema);

module.exports = {ShopEnrollmentEnquiry, ShopEnrollmentEnquiryAssign,  SupplierEnrollment};