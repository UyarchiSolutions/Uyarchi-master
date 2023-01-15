const mongoose = require('mongoose');
const { v4} = require('uuid');
const moment = require('moment');

const randomStockSchema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
      },
      product:{
        type: String,
      },
      productId:{
        type: String,
      },
      NSFQ1:{
        type: Number,
        default: 0,
      },
      NSFQ2:{
        type: Number,
        default: 0,
      },
      NSFQ3:{
        type: Number,
        default: 0,
      },
      NSFW_Wastage:{
        type: Number,
        default: 0,
      },
      wastedImageFile:{
        type: String,
      },
      date: {
        type: String,
        
      },
      time: {
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
      quantityToDestroy: {
        type:Number,
      },
      status: {
        type: String,
       
      }

    });

      const randomStockModel = mongoose.model('randomStockEntry',randomStockSchema);

      module.exports = randomStockModel;
