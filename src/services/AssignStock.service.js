const httpStatus = require('http-status');
const AssignStock = require('../models/AssignStock.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const createAssignStock = async (bodyData) => {
  let values = {
    ...bodyData,
    ...{ created: moment(), date: moment().format('DD-MM-YYYY'), time: moment().format('hh:mm a') },
  };
  return AssignStock.create(values);
};

const get_Current_Stock = async (id, date) => {
  let values = await AssignStock.aggregate([
    {
      $match: {
        $and: [{ date: { $eq: date } }, { type: { $eq: 'b2b' } }],
      },
    },
    {
      $lookup: {
        from: 'usablestocks',
        localField: 'usablestockId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ productId: { $eq: id } }],
            },
          },
        ],
        as: 'usablestock',
      },
    },
    {
      $unwind: '$usablestock',
    },
    {
      $group: {
        _id: null,
        qty: { $sum: '$quantity' },
      },
    },
  ]);
  return { qty: values.length == 0 ? 0 : values[0].qty };
};

module.exports = { createAssignStock, get_Current_Stock };
