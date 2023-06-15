const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
let currentDate = moment().format('DD-MM-YYYY');
const manageJob = require('../models/manageJob.model');
const manageEnquiry = require('../models/general.Enquiry.model');

const createUser = async (body) => {
    let serverdates = moment().format('YYYY-MM-DD');
    //console.log(typeof serverdates);
    let servertime = moment().format('hh:mm a');
  
    const group = await manageJob.find({ date: serverdates });
  
    //console.log(group);
  
    let center = '';
  
    if (group.length < 9) {
      center = '0000';
    }
    if (group.length < 99 && group.length >= 9) {
      center = '000';
    }
    if (group.length < 999 && group.length >= 99) {
      center = '00';
    }
    if (group.length < 9999 && group.length >= 999) {
      center = '0';
    }
    let userId = '';
    let totalcount = group.length + 1;
    //console.log(totalcount);
    userId = 'U' + center + totalcount;
  
    let values = {
      ...body,
      ...{
        UserId: userId,
        date: serverdates,
        time: servertime,
        created: moment(),
      },
    };
    let wardAdminGroupcreate = await manageJob.create(values);
   
    return wardAdminGroupcreate;
  };


  const getdata = async () => {
    return manageJob.find();
  };



  const createEnquiry = async (body) => {
    let serverdates = moment().format('YYYY-MM-DD');
    //console.log(typeof serverdates);
    let servertime = moment().format('hh:mm a');
  
    const group = await manageEnquiry.find({ date: serverdates });
  
    //console.log(group);
  
    let center = '';
  
    if (group.length < 9) {
      center = '0000';
    }
    if (group.length < 99 && group.length >= 9) {
      center = '000';
    }
    if (group.length < 999 && group.length >= 99) {
      center = '00';
    }
    if (group.length < 9999 && group.length >= 999) {
      center = '0';
    }
    let userId = '';
    let totalcount = group.length + 1;
    //console.log(totalcount);
    userId = 'Eq' + center + totalcount;
  
    let values = {
      ...body,
      ...{
        EnquireId: userId,
        date: serverdates,
        time: servertime,
        created: moment(),
      },
    };
    let wardAdminGroupcreate = await manageEnquiry.create(values);
   
    return wardAdminGroupcreate;
  };

  const getdataEqu = async () => {
    return manageEnquiry.find();
  };


module.exports = {
    createUser,
    getdata,
    createEnquiry,
    getdataEqu,

}