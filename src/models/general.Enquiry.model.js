const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');


const enquirySchema = mongoose.Schema({
    _id: {
        type: String,
        default: v4, 
    },
    EnquireId:{
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: Number,
    },
    enquiry: {
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
      date: {
        type: String,
       
      },
      time: {
        type: String,
        
      },
});

const manageEnquiry = mongoose.model('manageEnquiry',enquirySchema);
module.exports = manageEnquiry;