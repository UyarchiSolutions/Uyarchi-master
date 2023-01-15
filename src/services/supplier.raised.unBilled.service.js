const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { RaisedUnBilled, RaisedUnBilledHistory } = require('../models/supplier.raised.unbilled.model');
const moment = require('moment');

const createRaisedUnbilled = async (body) => {
  const { supplierId, raised_Amt } = body;
  const data = await RaisedUnBilled.findOne({ supplierId: supplierId });
  if (!data) {
    let values = { ...body, ...{ created: moment(), date: moment().format('YYYY-MM-DD') } };
    const create = await RaisedUnBilled.create(values);
    await RaisedUnBilledHistory.create({
      ...body,
      ...{ created: moment(), date: moment().format('YYYY-MM-DD'), raisedId: create._id },
    });
    return create;
  } else {
    let prevamt = data.raised_Amt;
    let newamt = parseInt(raised_Amt);
    let total = prevamt + newamt;
    let value = await RaisedUnBilled.findByIdAndUpdate({ _id: data._id }, { raised_Amt: total }, { new: true });
    await RaisedUnBilledHistory.create({
      ...body,
      ...{ created: moment(), date: moment().format('YYYY-MM-DD'), raisedId: data._id },
    });
    return value;
  }
};

const getRaisedSupplier = async () => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: '$suppliers',
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: 'supplierId',
        foreignField: 'supplierId',
        pipeline: [{ $group: { _id: null, total: { $sum: '$un_Billed_amt' } } }],
        as: 'unbilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$unbilled',
      },
    },
    {
      $project: {
        _id: 1,
        supplierId: 1,
        raised_Amt: 1,
        added_unBilled_amt: { $ifNull: ['$unbilled.total', 0] },
        supplierName: '$suppliers.primaryContactName',
        raisedBy: 1,
        date: 1,
        tradeName: '$suppliers.tradeName',
      },
    },
  ]);
  return values;
};

const getRaisedAmountHistory = async (id) => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $match: { supplierId: id },
    },
  ]);
  return values;
};

module.exports = { createRaisedUnbilled, getRaisedSupplier, getRaisedAmountHistory };
