const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');


const manageJobSchema = mongoose.Schema({
    _id: {
        type: String,
        default: v4, 
    },
    UserId:{
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
    Skills: {
        type: String,
    },
    ResidingLocation: {
        type: String,
    },
    education: {
        type: String,
    },
    resume: {
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

const manageJob = mongoose.model('manageJob',manageJobSchema);
module.exports = manageJob;