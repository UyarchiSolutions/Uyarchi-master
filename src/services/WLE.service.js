const httpStatus = require('http-status');
const { ShopOrderClone } = require('../models/shopOrder.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { wardAdminGroup, wardAdminGroupModel_ORDERS } = require('../models/b2b.wardAdminGroup.model');
const setPackedStatus_By_LoadingExecutice = async (body, userId) => {
  const { arr } = body;
  arr.forEach(async (e) => {
    await ShopOrderClone.findByIdAndUpdate(
      { _id: e },
      { status: 'Packed', completeStatus: 'Packed', WL_Packed_Time: moment() },
      { new: true }
    );

    // let statusActionArray = await ShopOrderClone.findByIdAndUpdate({ _id: e }, { new: true });
    // statusActionArray.statusActionArray.push({ userid: userId, date: moment().toString(), status: 'Packed' });
    // statusActionArray.save();

    let orderassign = await wardAdminGroupModel_ORDERS.findOne({ orderId: e });
    await wardAdminGroupModel_ORDERS.findByIdAndUpdate({ _id: orderassign._id }, { status: 'Packed' }, { new: true });
    // let wardgroup = await wardAdminGroupModel_ORDERS.find({
    //   wardAdminGroupID: orderassign.wardAdminGroupID,
    //   status: 'Assigned',
    // });
    // // //console.log(wardgroup);
    // if (wardgroup.length == 0) {
    //   await wardAdminGroup.findByIdAndUpdate({ _id: orderassign.wardAdminGroupID }, { status: 'Packed' }, { new: true });
    // }
  });
  return { message: 'Packed Status Updated By Ward Loading Executive' };
};

module.exports = {
  setPackedStatus_By_LoadingExecutice,
};
