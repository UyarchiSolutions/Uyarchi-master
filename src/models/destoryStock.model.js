const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');
const destoryStockSchema = mongoose.Schema({
    _id:{
        type:String,
        default: v4,
    },
    product: {
        type: String,
    },
    wastage: {
        type: Number,
    },
    worthRupees: {
        type: Number,
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
      status: {
        type: String,
        default: "Pending"
      },
      quantityToDestroy: {
        type:Number,
        default: 0,
      }
});

const destoryStock = mongoose.model('destroyStock',destoryStockSchema);
module.exports = destoryStock

