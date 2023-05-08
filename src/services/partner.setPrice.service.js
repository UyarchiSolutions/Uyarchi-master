const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { partnerPrice, PartnerProduct } = require('../models/partner.setPrice.models');
const moment = require('moment');

const SetPartnerPrice = async (body) => {
  let date = moment().format('YYYY-MM-dd');
  let time = moment().format('HH:mm a');
  let data = { ...body, ...{ date: date, time: time } };
  const creation = await partnerPrice.create(data);
  return creation;
};

const AddProductByPartner = async (body, partnerId) => {
  let date = moment().format('YYYY-MM-dd');
  let time = moment().format('HH:mm a');
  let data = { ...body, ...{ date: date, time: time, partnerId: partnerId } };
  const creation = await PartnerProduct.create(data);
  return creation;
};

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
};
