const httpStatus = require('http-status');
const { Market } = require('../models/market.model');
const { MarketShops, MarketClone, MarketShopsClone } = require('../models/market.model');
const manageUser = require('../models/manageUser.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const createmarket = async (marketbody) => {
  const { Uid } = marketbody;
  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = {
    ...marketbody,
    ...{ Uid: ManageUser.id, userName: ManageUser.name, userNo: ManageUser.mobileNumber, status: null },
  };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  return Market.create(values);
};

const createmarketClone = async (body) => {
  let servertime = moment().format('HHmmss');
  let serverdate = moment().format('DD-MM-yyy');
  let values = { ...body, ...{ date: serverdate, time: servertime } };
  const marketclone = await MarketClone.create(values);
  return marketclone;
};

const createmarketShopClone = async (body) => {
  let servertime = moment().format('HHmm');
  let serverdate = moment().format('DD-MM-yyy');
  let values = { ...body, ...{ date: serverdate, time: servertime } };
  const marketShopclone = await MarketShopsClone.create(values);
  return marketShopclone;
};

const getAllmarketShopClone = async () => {
  let marketShop = await MarketShopsClone.find();
  return marketShop;
};

const getmarketShopcloneById = async (id) => {
  const marketShop = await MarketShopsClone.findById(id);
  return marketShop;
};

const updatemarketShopCloneById = async (id, updateBody) => {
  let marketShopclone = await MarketShopsClone.findById(id);
  if (!marketShopclone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'marketShopclone Not Found');
  }
  marketShopclone = await MarketShopsClone.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return marketShopclone;
};

const getMarketShopsbyMarketId = async (id, page) => {
  let values = await MarketShopsClone.aggregate([
    {
      $match: {
        $and: [{ MName: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'UserData',
      },
    },
    {
      $unwind: '$UserData',
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'ShopData',
      },
    },
    {
      $unwind: '$ShopData',
    },
    {
      $lookup: {
        from: 'marketclones',
        localField: 'MName',
        foreignField: '_id',
        as: 'marketData',
      },
    },
    {
      $unwind: '$marketData',
    },
    {
      $project: {
        userName: '$UserData.name',
        marketName: '$marketData.MName',
        shopName: '$ShopData.shopList',
        image: 1,
        SName: 1,
        SNo: 1,
        mobile: 1,
        ownname: 1,
        ownnum: 1,
        mlatitude: 1,
        mlongitude: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await MarketShopsClone.find().count();
  return {
    values: values,
    total: total,
  };
};

const getMarketCloneWithAggregation = async (page) => {
  let aggre = await MarketClone.aggregate([
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetData',
      },
    },
    {
      $unwind: '$streetData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },

    {
      $project: {
        userData: '$userData.name',
        streetData: '$streetData.street',
        wardDate: '$wardData.ward',
        MName: 1,
        locality: 1,
        LandMark: 1,
        mlongitude: 1,
        mlatitude: 1,
        created: 1,
        date: 1,
        address: 1,
        pincode: 1,
        image: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await MarketClone.aggregate([
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetData',
      },
    },
    {
      $unwind: '$streetData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },
  ]);
  return {
    value: aggre,
    total: total.length,
  };
};

const getmarketShopCloneWithAggregation = async (page) => {
  let aggre = await MarketShopsClone.aggregate([
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },

    {
      $project: {
        userData: '$userData.name',
        shopName: '$shopData.shopList',
        mobile: 1,
        ownname: 1,
        ownnum: 1,
        mlatitude: 1,
        mlongitude: 1,
        SName: 1,
        image: 1,
        SNo: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await MarketShopsClone.find().count();
  return {
    value: aggre,
    total: total,
  };
};

const getAllmarketClone = async () => {
  let market = await MarketClone.find();
  return market;
};

const getmarketcloneById = async (id) => {
  const market = await MarketClone.findById(id);
  return market;
};

const updatemarketCloneById = async (id, updateBody) => {
  let marketclone = await MarketClone.findById(id);
  if (!marketclone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market Clone Not Found');
  }
  marketclone = await MarketClone.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return marketclone;
};

const deletemarketCloneById = async (id) => {
  const market = await MarketClone.findById(id);
  if (!market) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Market Clone Not Found');
  }
  (market.active = false), (market.archive = true);
  await market.save();
};

const createMarketShops = async (marketShopsBody) => {
  const { Uid } = marketShopsBody;
  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = { ...marketShopsBody, ...{ Uid: ManageUser.id, status: null } };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  //console.log(values);
  return MarketShops.create(values);
};

const getmarketById = async (id) => {
  const mark = Market.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    {
      $project: {
        street: '$streetsdata.street',
        MName: 1,
        locality: 1,
        pincode: 1,
        LandMark: 1,
        Strid: 1,
        Uid: 1,
        mlongitude: 1,
        mlatitude: 1,
        userName: 1,
        userNo: 1,
        status: 1,
        image: 1,
        created: 1,
      },
    },
  ]);
  // if (!mark || mark.active === false) {
  //   throw new ApiError(httpStatus.NOT_FOUND, ' market Not Found');
  // }
  return mark;
};

const getMarketShops = async (marketId, page) => {
  // const mark = await MarketShops.find({MName:id});
  const mark = await MarketShops.aggregate([
    {
      $match: {
        $and: [{ MName: { $eq: marketId } }, { active: { $eq: true } }],
      },
    },
    {
      $lookup: {
        from: 'manageusers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'manageusersdata',
      },
    },
    {
      $unwind: '$manageusersdata',
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplistsdata',
      },
    },
    {
      $unwind: '$shoplistsdata',
    },
    {
      $lookup: {
        from: 'markets',
        localField: 'MName',
        foreignField: '_id',
        as: 'marketsdata',
      },
    },
    {
      $unwind: '$marketsdata',
    },
    {
      $project: {
        ShopType: '$shoplistsdata.shopList',
        MName: '$marketsdata.MName',
        SName: 1,
        SNo: 1,
        Stype: 1,
        mobile: 1,
        ownname: 1,
        ownnum: 1,
        mlatitude: 1,
        mlongitude: 1,
        image: 1,
        status: 1,
        reason: 1,
        userName: '$manageusersdata.name',
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const count = await MarketShops.aggregate([
    {
      $match: {
        $and: [{ MName: { $eq: marketId } }, { active: { $eq: true } }],
      },
    },
    //    {
    //     $lookup:{
    //       from: 'manageusers',
    //       localField: 'Uid',
    //       foreignField: '_id',
    //       as: 'manageusersdata',
    //     }
    //   },
    //   {
    //     $unwind:'$manageusersdata'
    //   },
    //    {
    //     $lookup:{
    //       from: 'shoplists',
    //       localField: 'SType',
    //       foreignField: '_id',
    //       as: 'shoplistsdata',
    //     }
    //   },
    //   {
    //     $unwind:'$shoplistsdata'
    //   },
    //   {
    //     $lookup:{
    //       from: 'markets',
    //       localField: 'MName',
    //       foreignField: '_id',
    //       as: 'marketsdata',
    //     }
    //   },
    //   {
    //     $unwind:'$marketsdata'
    //   },
    //   {
    //   $project:{

    //       ShopType:'$shoplistsdata.shopList',
    //       MName:'$marketsdata.MName',
    //       SName:1,
    //       SNo:1,
    //       mobile:1,
    //       ownname:1,
    //       ownnum:1,
    //       mlatitude:1,
    //       mlongitude:1,
    //       image:1,
    //       status:1,
    //       reason:1,
    //       userName:'$manageusersdata.name'
    //    },
    // },
  ]);

  return {
    data: mark,
    count: count.length,
  };
};

const getMarketShopsById = async (id) => {
  const mark = MarketShops.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }, { active: { $eq: true } }],
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplistsdata',
      },
    },
    {
      $unwind: '$shoplistsdata',
    },
    {
      $lookup: {
        from: 'markets',
        localField: 'MName',
        foreignField: '_id',
        as: 'marketsdata',
      },
    },
    {
      $unwind: '$marketsdata',
    },
    {
      $project: {
        ShopType: '$shoplistsdata.shopList',
        MName: '$marketsdata.MName',
        SName: 1,
        SNo: 1,
        mobile: 1,
        ownname: 1,
        ownnum: 1,
        mlatitude: 1,
        mlongitude: 1,
        image: 1,
        status: 1,
        reason: 1,
      },
    },
  ]);

  // if (!mark || mark.active === false) {
  //   throw new ApiError(httpStatus.NOT_FOUND, ' MarketShops Not Found');
  // }
  return mark;
};

const getAllmarket = async () => {
  return Market.aggregate([
    // {
    //   $lookup:{
    //     from: 'manageusers',
    //     localField: 'Uid',
    //     foreignField: '_id',
    //     as: 'manageusersdata',
    //   }
    // },
    // {
    //   $unwind:'$manageusersdata'
    // },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    {
      $project: {
        _id: 1,
        MName: 1,
        locality: 1,
        pincode: 1,
        LandMark: 1,
        Strid: 1,
        Uid: 1,
        mlongitude: 1,
        mlatitude: 1,
        userName: 1,
        userNo: 1,
        status: 1,
        created: 1,
        image: 1,
        street: '$streetsdata.street',
      },
    },
  ]);
};

const getAllmarketTable = async (id, page) => {
  let match;
  if (id != 'null') {
    match = [{ _id: { $eq: id } }, { active: { $eq: true } }];
  } else {
    match = [{ _id: { $ne: null } }, { active: { $eq: true } }];
  }
  const mark = await Market.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const count = await Market.aggregate([
    {
      $match: {
        $and: match,
      },
    },
  ]);
  //console.log(mark);
  return {
    data: mark,
    count: count.length,
  };
};

const getAllmarketShops = async () => {
  return MarketShops.find();
};
// const querCombo = async (filter, options) => {
//   return ProductCombo.paginate(filter, options);
// };

const updatemarketById = async (marketId, updateBody) => {
  let mark = await getmarketById(marketId);
  if (!mark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market not found');
  }
  mark = await Market.findByIdAndUpdate({ _id: marketId }, updateBody, { new: true });
  return mark;
};

const updatemarketShopsById = async (marketShopId, updateBody) => {
  let mark = await getMarketShopsById(marketShopId);
  if (!mark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'marketShops not found');
  }
  mark = await MarketShops.findByIdAndUpdate({ _id: marketShopId }, updateBody, { new: true });
  return mark;
};

const deletemarketById = async (marketId) => {
  const mark = await getmarketById(marketId);
  if (!mark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market not found');
  }
  (mark.active = false), (mark.archive = true), await mark.save();
  return mark;
};

const deletemarketShopsById = async (marketShopId) => {
  const mark = await getMarketShopsById(marketShopId);
  if (!mark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'marketShops not found');
  }
  (mark.active = false), (mark.archive = true), await mark.save();
  return mark;
};

module.exports = {
  createmarket,
  getMarketShopsbyMarketId,
  getMarketCloneWithAggregation,
  createmarketClone,
  getmarketcloneById,
  getmarketById,
  getAllmarketClone,
  updatemarketCloneById,
  deletemarketCloneById,
  updatemarketById,
  deletemarketById,
  getAllmarket,
  deletemarketShopsById,
  updatemarketShopsById,
  getAllmarketShops,
  createMarketShops,
  getMarketShops,
  getMarketShopsById,
  getAllmarketTable,
  createmarketShopClone,
  getAllmarketShopClone,
  getmarketShopCloneWithAggregation,
  getmarketShopcloneById,
  updatemarketShopCloneById,
};
