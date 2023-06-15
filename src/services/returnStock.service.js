const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const ReturnStock = require('../models/returnStocks.model');
const { wardAdminGroup } = require('../models/b2b.wardAdminGroup.model');
const { ShopOrderClone } = require('../models/shopOrder.model');
const ReturnStockhistories = require('../models/returnStock.histories.model')

const create_ReturnStock = async (body, userid) => {
  let { groupId, stocks } = body;
  //console.log(stocks)
  let values = {
    ...body,
    ...{ created: moment(), date: moment().format('YYYY-MM-DD'), time: moment().format('HHmmss'), status: 'received' },
  };
  if (!groupId) {
    throw new ApiError('Gruop Id Required');
  }
  await wardAdminGroup.findByIdAndUpdate(
    { _id: groupId },
    { returnStockstatus: 'returnedStock', returnstockdate: moment(), status: 'returnedStock' },
    { new: true }
  );
  // let findGroup = await wardAdminGroup.findOne({ _id: groupId });
  // await findGroup.Orderdatas.forEach(async (e) => {
  //   let shoporder = await ShopOrderClone.findOne({ _id: e._id });
  //   await ShopOrderClone.findByIdAndUpdate({ _id: e._id }, { status: 'returnedStock' }, { new: true });
  //   shoporder.statusActionArray.push({ userid: userid, date: moment().toString(), status: 'returnedStock' });
  //   shoporder.save();
  // });

  let create = await ReturnStock.create(values);
  stocks.forEach(async (e) => {
    let value = { productId: e.id, returnStockId: create._id, product: e.productName, actualStock: e.actualStock, wastageStock: e.wastageStock, mismatch: e.mismatch, groupId: groupId, created: moment() }
    await ReturnStockhistories.create(value)
  })
  return create;
};

module.exports = {
  create_ReturnStock,
};
