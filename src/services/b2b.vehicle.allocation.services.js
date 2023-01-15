const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const vehicleModel = require('../models/b2b.vehicle.Allocation.models');
const moment = require('moment');
const { Shop } = require('../models/b2b.ShopClone.model');

const createvehicle = async (body) => {

    let time = moment().format('hh:mm a');
  let date = moment().format('yyyy-MM-DD');
  let created = moment();
  let datas = {
    time : time,
    date : date,
    created : created,
  };
  let bodyData = { ...datas, ...body};
  return vehicleModel.create(bodyData);

};

module.exports = {
    createvehicle,
}