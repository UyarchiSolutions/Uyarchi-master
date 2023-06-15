const httpStatus = require('http-status');
const { Shop, AttendanceClone, AttendanceClonenew } = require('../models/b2b.ShopClone.model');
const { MarketShopsClone, MarketClone } = require('../models/market.model');
const { Users } = require('../models/B2Busers.model');
const ApiError = require('../utils/ApiError');
const Textlocal = require('../config/textLocal');
const Verfy = require('../config/OtpVerify');
const RegisterOtp = require('../config/registerOtp');
const moment = require('moment');
const { verfiy } = require('../config/registerOTP.Verify');
const { ShopList } = require('../models/product.model');
const Ward = require('../models/ward.model');
// Shop Clone Serive
const axios = require('axios');

const createShopClone = async (shopBody) => {
  let servertime = moment().format('HHmm');
  let createdtime = moment().format('hh:mm a');
  let serverdate = moment().format('DD-MM-yyy');
  let filterDate = moment().format('yyy-MM-DD');
  let values = {
    ...shopBody,
    ...{ date: serverdate, time: servertime, filterDate: filterDate, status: 'Pending', created: createdtime },
  };
  const shop = await Shop.create(values);
  return shop;
};

const insertOrder = async () => {
  let i = 0;

  // let shops = await Shop.find();
  // let up = shops.forEach(async (e) => {
  //   i = i + 1;
  //   await Shop.findByIdAndUpdate({ _id: e._id }, { displaycount: i }, { new: true });
  // });
  // return up;
};

const getStreetAndShopDetails = async (supplierId) => {
  let values = await Shop.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: supplierId } }],
      },
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
      $project: {
        SName: 1,
        mobile: 1,
        date: 1,
        time: 1,
        Uid: 1,
        streetName: '$streetData.street',
      },
    },
  ]);
  return values;
};

const filterShopwithNameAndContact = async (key) => {
  const marketClone = await MarketShopsClone.aggregate([
    {
      $match: {
        $or: [
          { SName: { $regex: key, $options: 'i' } },
          { mobile: { $regex: key, $options: 'i' } },
          { ownnum: { $regex: key, $options: 'i' } },
        ],
      },
    },
  ]);
  const shop = await Shop.aggregate([
    {
      $match: {
        $or: [{ SName: { $regex: key, $options: 'i' } }, { mobile: { $regex: key, $options: 'i' } }],
      },
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
      $limit: 50,
    },
    {
      $project: {
        SName: 1,
        mobile: 1,
        streetName: '$streetData.street',
        _id: 1,
        SOwner: 1,
        SType: 1,
        Slat: 1,
        Slong: 1,
        Strid: 1,
        Uid: 1,
        Wardid: 1,
        callingUserId: 1,
        created: 1,
        date: 1,
        marketId: 1,
        mobile: 1,
        photoCapture: 1,
        status: 1,
        time: 1,
        type: 1,
        streetId: '$streetData._id',
      },
    },
  ]);
  const returns = marketClone.concat(shop);

  return returns;
};

const searchShops_By_Name = async (key) => {
  let values = await Shop.aggregate([
    {
      $match: {
        $or: [{ SName: { $regex: key, $options: 'i' } }, { mobile: { $regex: key, $options: 'i' } }],
      },
    },
    {
      $limit: 20,
    },
  ]);
  return values;
};

const getAllShopClone = async () => {
  return Shop.find();
};

const searchShops = async (key) => {
  let values = await Shop.aggregate([
    {
      $match: {
        $or: [{ SName: { $regex: key, $options: 'i' } }],
      },
    },
    {
      $limit: 90,
    },
  ]);
  return values;
};
const getshop_myshops_asm = async (page, userId) => {
  //console.log(userId);
  let values = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $or: [
          { salesManStatus: { $eq: 'Assign' } },
          { salesManStatus: { $eq: 'tempReassign' } },
          { salesManStatus: { $eq: 'Reassign' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              status: { $ne: 'Reassign' },
            },
          },
          {
            $lookup: {
              from: 'asmsalesmen',
              localField: 'fromSalesManId',
              foreignField: 'salesManId',
              pipeline: [
                {
                  $match: {
                    asmId: { $eq: userId },
                    status: { $ne: 'Reassign' },
                  },
                },
              ],
              as: 'asmsalesmen',
            },
          },
          {
            $unwind: {
              path: '$asmsalesmen',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'asmsalesmen',
              localField: 'salesManId',
              foreignField: 'salesManId',
              pipeline: [
                {
                  $match: {
                    asmId: { $eq: userId },
                    status: { $ne: 'Reassign' },
                  },
                },
              ],
              as: 'salesManId',
            },
          },
          {
            $unwind: {
              path: '$salesManId',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              salesManId: '$salesManId',
              asmsalesmen: '$asmsalesmen',
            },
          },
          {
            $match: {
              $or: [{ salesManId: { $ne: null } }, { asmsalesmen: { $ne: null } }],
            },
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        salesmanshops: '$salesmanshops',
        gomap: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $or: [
          { salesManStatus: { $eq: 'Assign' } },
          { salesManStatus: { $eq: 'tempReassign' } },
          { salesManStatus: { $eq: 'Reassign' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              status: { $ne: 'Reassign' },
            },
          },
          {
            $lookup: {
              from: 'asmsalesmen',
              localField: 'fromSalesManId',
              foreignField: 'salesManId',
              pipeline: [
                {
                  $match: {
                    asmId: { $eq: userId },
                    status: { $ne: 'Reassign' },
                  },
                },
              ],
              as: 'asmsalesmen',
            },
          },
          {
            $unwind: {
              path: '$asmsalesmen',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'asmsalesmen',
              localField: 'salesManId',
              foreignField: 'salesManId',
              pipeline: [
                {
                  $match: {
                    asmId: { $eq: userId },
                    status: { $ne: 'Reassign' },
                  },
                },
              ],
              as: 'salesManId',
            },
          },
          {
            $unwind: {
              path: '$salesManId',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              salesManId: '$salesManId',
              asmsalesmen: '$asmsalesmen',
            },
          },
          {
            $match: {
              $or: [{ salesManId: { $ne: null } }, { asmsalesmen: { $ne: null } }],
            },
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        salesmanshops: '$salesmanshops',
      },
    },
  ]);
  return {
    values: values,
    total: total.length,
  };
};

const getshop_myshops = async (page, userId) => {
  //console.log(userId);
  let values = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $or: [
          { salesManStatus: { $eq: 'Assign' } },
          { salesManStatus: { $eq: 'tempReassign' } },
          { salesManStatus: { $eq: 'Reassign' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $or: [
                { salesManId: userId, fromSalesManId: userId, status: 'Assign' },
                { salesManId: userId, status: 'tempReassign' },
              ],
            },
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $or: [
          { salesManStatus: { $eq: 'Assign' } },
          { salesManStatus: { $eq: 'tempReassign' } },
          { salesManStatus: { $eq: 'Reassign' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $or: [
                { salesManId: userId, fromSalesManId: userId, status: 'Assign' },
                { salesManId: userId, status: 'tempReassign' },
              ],
            },
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
      },
    },
  ]);
  return {
    values: values,
    total: total.length,
  };
};

const getshopWardStreetNamesWithAggregation = async (page) => {
  let values = await Shop.aggregate([
    // {
    //   $match: {
    //     $and: [{ type: { $eq: 'shop' } }],
    //   },
    // },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        Pincode: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.find().count();

  return {
    values: values,
    total: total,
  };
};

const getshopWardStreetNamesWithAggregation_withfilter_all = async (district, zone, ward, street) => {
  let districtMatch = { active: true };
  let zoneMatch = { active: true };
  let wardMatch = { active: true };
  let streetMatch = { active: true };
  if (district != 'null') {
    districtMatch = { ...districtMatch, ...{ district: district } };
  }
  if (zone != 'null') {
    districtMatch = { ...districtMatch, ...{ zoneId: zone } };
  }
  if (ward != 'null') {
    wardMatch = { Wardid: { $eq: ward } };
  }
  if (street != 'null') {
    streetMatch = { Strid: { $eq: street } };
  }
  //console.log(districtMatch);

  let values = await Shop.aggregate([
    {
      $match: {
        $and: [wardMatch, streetMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: districtMatch,
          },
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    {
      $unwind: '$shoptype',
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: '$shoptype.shopList',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        active: 1,
        mobile: 1,
        date: 1,
      },
    },
  ]);
  return values;
};

const getshopWardStreetNamesWithAggregation_withfilter = async (district, zone, ward, street, status, page) => {
  // await Shop.updateMany({ active: true }, { $set: { status: 'Pending' } });
  let districtMatch = { active: true };
  let zoneMatch = { active: true };
  let wardMatch = { active: true };
  let streetMatch = { active: true };
  let statusMatch = { active: true };
  if (status != 'null') {
    streetMatch = { status: status };
  }
  if (district != 'null') {
    districtMatch = { ...districtMatch, ...{ district: district } };
  }
  if (zone != 'null') {
    districtMatch = { ...districtMatch, ...{ zoneId: zone } };
  }
  if (ward != 'null') {
    wardMatch = { Wardid: { $eq: ward } };
  }
  if (street != 'null') {
    streetMatch = { Strid: { $eq: street } };
  }
  //console.log(districtMatch);

  let values = await Shop.aggregate([
    {
      $match: {
        $and: [wardMatch, streetMatch, statusMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: districtMatch,
          },
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        // shoptype: '$shoptype.shopList',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        type: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        active: 1,
        mobile: 1,
        date: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_CREATED: 1,
        DA_USERNAME: '$DA_USERNAME.name',
        purchaseQTy: 1,
        da_lot: 1,
        da_long: 1,
        da_landmark: 1,
        Pincode: 1,
        daStatus: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: [wardMatch, streetMatch, statusMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: districtMatch,
          },
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },
  ]);
  return {
    values: values,
    total: total.length,
  };
};

const getshopWardStreetNamesWithAggregation_withfilter_daily_all = async (user, startdata, enddate, starttime, endtime) => {
  ///:user/:startdata/:enddate/:starttime/:endtime/:page
  let userMatch = { active: true };
  let dateMatch = { active: true };
  let timeMatch = { active: true };
  let streetMatch = { active: true };
  let startTime = 0;
  let endTime = 2400;
  if (user != 'null') {
    userMatch = { Uid: user };
  }
  if (startdata != 'null' && enddate != 'null') {
    dateMatch = { filterDate: { $gte: startdata, $lte: enddate } };
  }
  if (starttime != 'null') {
    startTime = parseInt(starttime);
  }
  if (endtime != 'null') {
    endTime = parseInt(endtime);
  }
  timeMatch = { time: { $gte: startTime, $lte: endTime } };

  let values = await Shop.aggregate([
    {
      $sort: { filterDate: -1 },
    },
    {
      $match: {
        $and: [userMatch, dateMatch, timeMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: '$shoptype.shopList',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        active: 1,
        mobile: 1,
        date: 1,
        displaycount: 1,
      },
    },
  ]);
  return values;
};

const getshopWardStreetNamesWithAggregation_withfilter_daily = async (
  user,
  startdata,
  enddate,
  starttime,
  endtime,
  status,
  page
) => {
  ///:user/:startdata/:enddate/:starttime/:endtime/:page
  let userMatch = { active: true };
  let dateMatch = { active: true };
  let timeMatch = { active: true };
  let streetMatch = { active: true };
  let startTime = 0;
  let endTime = 2400;
  let sortTime = { filterDate: -1 };
  let statusMatch = { active: true };
  if (status != 'null') {
    streetMatch = { status: status };
  }
  if (status == 'data_approved') {
    sortTime = { DA_DATE: -1, DA_TIME: -1 };
  }
  if (user != 'null' && status != 'data_approved') {
    userMatch = { Uid: user };
  } else if (user != 'null' && status == 'data_approved') {
    userMatch = { DA_USER: user };
    sortTime = { DA_DATE: -1, DA_TIME: -1 };
  }
  if (startdata != 'null' && enddate != 'null' && status != 'data_approved') {
    dateMatch = { filterDate: { $gte: startdata, $lte: enddate } };
  } else if (startdata != 'null' && enddate != 'null' && status == 'data_approved') {
    dateMatch = { DA_DATE: { $gte: startdata, $lte: enddate } };
    sortTime = { DA_DATE: -1, DA_TIME: -1 };
  }
  if (starttime != 'null') {
    startTime = parseInt(starttime);
  }
  if (endtime != 'null') {
    endTime = parseInt(endtime);
  }
  if (status != 'data_approved') {
    timeMatch = { time: { $gte: startTime, $lte: endTime } };
  } else {
    timeMatch = {
      DA_TIME: { $gte: startTime, $lte: endTime },
    };
  }

  let values = await Shop.aggregate([
    {
      $sort: sortTime,
    },
    {
      $match: {
        $and: [userMatch, dateMatch, timeMatch, streetMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'DA_USERNAME',
      },
    },
    {
      $unwind: {
        path: '$DA_USERNAME',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        type: 1,
        active: 1,
        mobile: 1,
        date: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_CREATED: 1,
        DA_USERNAME: '$DA_USERNAME.name',
        purchaseQTy: 1,
        da_lot: 1,
        da_long: 1,
        da_landmark: 1,
        Pincode: 1,
        daStatus: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.aggregate([
    {
      $sort: { filterDate: -1 },
    },
    {
      $match: {
        $and: [userMatch, dateMatch, timeMatch, streetMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },
  ]);

  // let da = await Shop.find({ status: "data_approved" })
  // da.forEach(async(e) => {
  //   await Shop.findByIdAndUpdate({ _id: e._id }, { status: "Pending" });
  // });

  return {
    values: values,
    total: total.length,
  };
};

const getShopById = async (id) => {
  const shop = await Shop.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    {
      $unwind: {
        path: '$shoptype',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        status: 1,
        kyc_status: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        Slong: 1,
        address: 1,
        created: 1,
        date: 1,
        time: 1,
        filterDate: 1,
        Uid: 1,
        sortdate: 1,
        historydate: 1,
        displaycount: 1,
        callingUserId: 1,
        sorttime: 1,
        lapsedOrder: 1,
        shoptype: '$shoptype.shopList',
      },
    },
  ]);
  return shop[0];
};

const updateShopById = async (id, updateBody) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not found');
  }
  shop = await Shop.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return shop;
};

const updateShopStatus = async (id, status, bodyData, userID) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop Not Found');
  }
  let servertime = moment().format('HHmm');
  let serverdate = moment().format('YYYY-MM-DD');
  shop = await Shop.findByIdAndUpdate(
    { _id: id },
    { ...bodyData, ...{ status: status, DA_DATE: serverdate, DA_USER: userID, DA_CREATED: moment(), DA_TIME: servertime } },
    { new: true }
  );
  return shop;
};

const update_reverification = async (id, status, bodyData, userID) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop Not Found');
  }
  let servertime = moment().format('HHmm');
  let serverdate = moment().format('YYYY-MM-DD');
  shop = await Shop.findByIdAndUpdate(
    { _id: id },
    {
      ...bodyData,
      ...{ status: status, Re_DA_DATE: serverdate, Re_DA_USER: userID, Re_DA_CREATED: moment(), Re_DA_TIME: servertime },
    },
    { new: true }
  );
  return shop;
};

const update_reverification_custmer = async (id, bodyData, userID) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop Not Found');
  }

  let servertime = moment().format('HHmm');
  let serverdate = moment().format('YYYY-MM-DD');
  shop = await Shop.findByIdAndUpdate(
    { _id: id },
    {
      ...bodyData,
      ...{
        customer_final_date: serverdate,
        customer_final_USER: userID,
        customer_final_CREATED: moment(),
        customer_final_TIME: servertime,
      },
    },
    { new: true }
  );
  return shop;
};

// register user

const craeteRegister = async (shopBody) => {
  const { mobile } = shopBody;
  const register = await Users.findOne({ phoneNumber: mobile });
  // //console.log(register);
  if (register) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MobileNumber already registered');
  } else if (register == null) {
    const shop = await Shop.find({ mobile: mobile });
    if (shop.length != 0) {
      return shop;
    } else {
      // let b2bshop = await Shop.create(shopBody);
      await RegisterOtp.Otp(mobile);
      return 'OTP send successfully';
    }
  }
};

const verifyRegisterOTP = async (body) => {
  const { otp, mobileNumber } = body;
  return await verfiy(otp, mobileNumber);
};

const deleteShopById = async (id) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUNDm, 'Shop Not Found');
  }
  (shop.active = false), (shop.archive = true);
  await shop.save();
  return shop;
};

// Attendance Clone Service

const createAttendanceClone = async (shopBody) => {
  let servertime = moment().format('HHmm');
  let servercreatetime = moment().format('hh:mm a');
  let serverdate = moment().format('DD-MM-yyy');
  let values = { ...shopBody, ...{ date: serverdate, time: servertime, created: servercreatetime } };
  const attendance = await AttendanceClone.create(values);
  return attendance;
};

const createAttendanceClone_new = async (shopBody) => {
  let servertime = moment().format('HHmmss');
  let servercreatetime = moment().format('hh:mm a');
  let serverdate = moment().format('yyyy-MM-DD');
  let values = { ...shopBody, ...{ date: serverdate, time: servertime, created: servercreatetime, createdAt: moment() } };
  const attendance = await AttendanceClonenew.create(values);
  return attendance;
};

const getAllAttendanceClone = async (id, date, fromtime, totime, page) => {
  let match;
  let to;
  let from;
  if (parseInt(fromtime) <= parseInt(totime)) {
    to = parseInt(fromtime);
    from = parseInt(totime);
  } else {
    to = parseInt(totime);
    from = parseInt(fromtime);
  }
  if (id != 'null' && date != 'null' && fromtime != 'null' && totime != 'null') {
    //  match=[{ Uid: { $eq: id }},{ date: { $eq: date }},{ time:{ $gte: from,$lte: to}},{active:{$eq:true}}];
    const d = new Date(date);
    date = moment(d).format('YYYY-MM-DD');
    match = [
      { Uid: { $eq: id } },
      { date: { $eq: date } },
      { time: { $gte: to } },
      { time: { $lte: from } },
      { active: { $eq: true } },
    ];
  } else if (id != 'null' && date == 'null' && fromtime == 'null' && totime == 'null') {
    match = [{ Uid: { $eq: id } }, { active: { $eq: true } }];
  } else if (id == 'null' && date != 'null' && fromtime == 'null' && totime == 'null') {
    match = [{ date: { $eq: date } }, { active: { $eq: true } }];
    //console.log('df');
  } else if (id == 'null' && (date == 'null') & (fromtime != 'null') && totime != 'null') {
    //  match=[{ time:{ $gte: from}},{ time:{$lte: to}},{active:{$eq:true}}]
    match = [{ time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id == 'null' && date != 'null' && fromtime != 'null' && totime != 'null') {
    const d = new Date(date);
    date = moment(d).format('YYYY-MM-DD');
    //  match=[{ date: { $eq: date }},{ time:{$lte: to ,$gte: from}},{active:{$eq:true}}]
    match = [{ date: { $eq: date } }, { time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id != 'null' && date == 'null' && fromtime != 'null' && totime != 'null') {
    //  match=[{ Uid: { $eq: id }},{ time:{$lte: to, $gte: from}},{active:{$eq:true}}]
    match = [{ Uid: { $eq: id } }, { time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id != 'null' && date != 'null' && fromtime == 'null' && totime == 'null') {
    const d = new Date(date);
    date = moment(d).format('YYYY-MM-DD');
    match = [{ Uid: { $eq: id } }, { date: { $eq: date } }, { active: { $eq: true } }];
  } else {
    match = [{ Uid: { $ne: null } }, { active: { $eq: true } }];
  }
  const data = await AttendanceClonenew.aggregate([
    { $sort: { date: -1, time: -1 } },
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    { $unwind: '$b2busersData' },
    { $skip: 10 * page },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        active: 1,
        true: 1,
        archive: 1,
        false: 1,
        Alat: 1,
        Along: 1,
        date: 1,
        time: 1,
        created: 1,
        image: 1,
        userName: '$b2busersData.name',
        phoneNumber: '$b2busersData.phoneNumber',
      },
    },
  ]);
  const count = await AttendanceClonenew.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    { $unwind: '$b2busersData' },
  ]);

  return {
    data: data,
    count: count.length,
  };
};

const getAllAttendanceCloneforMapView = async (id, date, fromtime, totime) => {
  let match;
  let to;
  let from;
  const d = new Date(date);
  date = moment(d).format('YYYY-MM-DD');
  if (parseInt(fromtime) <= parseInt(totime)) {
    to = parseInt(fromtime);
    from = parseInt(totime);
  } else {
    to = parseInt(totime);
    from = parseInt(fromtime);
  }
  if (id != 'null' && date != 'null' && fromtime != 'null' && totime != 'null') {
    //  match=[{ Uid: { $eq: id }},{ date: { $eq: date }},{ time:{ $gte: from,$lte: to}},{active:{$eq:true}}];
    match = [
      { Uid: { $eq: id } },
      { date: { $eq: date } },
      { time: { $gte: to } },
      { time: { $lte: from } },
      { active: { $eq: true } },
    ];
  } else if (id != 'null' && date == 'null' && fromtime == 'null' && totime == 'null') {
    match = [{ Uid: { $eq: id } }, { active: { $eq: true } }];
  } else if (id == 'null' && date != 'null' && fromtime == 'null' && totime == 'null') {
    match = [{ date: { $eq: date } }, { active: { $eq: true } }];
    //console.log('df');
  } else if (id == 'null' && (date == 'null') & (fromtime != 'null') && totime != 'null') {
    //  match=[{ time:{ $gte: from}},{ time:{$lte: to}},{active:{$eq:true}}]
    match = [{ time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id == 'null' && date != 'null' && fromtime != 'null' && totime != 'null') {
    //  match=[{ date: { $eq: date }},{ time:{$lte: to ,$gte: from}},{active:{$eq:true}}]
    match = [{ date: { $eq: date } }, { time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id != 'null' && date == 'null' && fromtime != 'null' && totime != 'null') {
    //  match=[{ Uid: { $eq: id }},{ time:{$lte: to, $gte: from}},{active:{$eq:true}}]
    match = [{ Uid: { $eq: id } }, { time: { $gte: to } }, { time: { $lte: from } }, { active: { $eq: true } }];
  } else if (id != 'null' && date != 'null' && fromtime == 'null' && totime == 'null') {
    match = [{ Uid: { $eq: id } }, { date: { $eq: date } }, { active: { $eq: true } }];
  } else {
    match = [{ Uid: { $ne: null } }, { active: { $eq: true } }];
  }
  const data = await AttendanceClonenew.aggregate([
    { $sort: { date: -1, time: -1 } },
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    { $unwind: '$b2busersData' },
    {
      $project: {
        Alat: 1,
        Along: 1,
        created: 1,
        date: 1,
      },
    },
  ]);
  return data;
};

const getAttendanceById = async (id) => {
  const attendance = await AttendanceClone.findById(id);
  return attendance;
};

const updateAttendanceById = async (id, updateBody) => {
  let attendance = await getAttendanceById(id);
  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not found');
  }
  attendance = await AttendanceClone.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return attendance;
};

const deleteAttendanceById = async (id) => {
  let attendance = await getAttendanceById(id);
  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUNDm, 'attendance Not Found');
  }
  (attendance.active = false), (attendance.archive = true);
  await attendance.save();
  return attendance;
};

const totalCount = async (userId) => {
  const moment = require('moment');
  let datenow = moment(new Date()).format('DD-MM-YYYY');
  const Totalcount = await Shop.find({ Uid: userId, type: 'shop' }).count();
  const Secondtotal = await Shop.find({ Uid: userId, type: 'second' }).count();
  const todayCount = await Shop.find({ date: datenow, Uid: userId, type: 'shop' }).count();
  const secontodayCount = await Shop.find({ date: datenow, Uid: userId, type: 'second' }).count();

  const marketTotalcount = await MarketClone.find({ Uid: userId }).count();
  const markettodayCount = await MarketClone.find({ date: datenow, Uid: userId }).count();
  const marketshopTotalcount = await Shop.find({ Uid: userId, type: 'market' }).count();
  const marketshoptodayCount = await Shop.find({ date: datenow, Uid: userId, type: 'market' }).count();
  // //console.log(Totalcount, todayCount, marketTotalcount, markettodayCount, marketshopTotalcount, marketshoptodayCount);
  return {
    shopTotal: Totalcount,
    shopToday: todayCount,
    marketTotal: marketTotalcount,
    marketToday: markettodayCount,
    marketShopTotal: marketshopTotalcount,
    marketShopToday: marketshoptodayCount,
    Secondtotal: Secondtotal,
    secontodayCount: secontodayCount,
  };
};

// get marketShop

const getMarkeShop = async (marketId, page) => {
  let values = await Shop.aggregate([
    {
      $match: {
        $and: [{ type: { $eq: 'market' } }, { marketId: { $eq: marketId } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    {
      $unwind: '$shoptype',
    },
    {
      $lookup: {
        from: 'marketclones',
        localField: 'marketId',
        foreignField: '_id',
        as: 'marketData',
      },
    },
    {
      $unwind: '$marketData',
    },
    {
      $limit: 10,
    },
    {
      $skip: 10 * page,
    },
    {
      $project: {
        _id: 1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: '$shoptype.shopList',
        marketName: '$marketData.MName',
        photoCapture: 1,
        SName: 1,
        Slat: 1,
        Slong: 1,
        created: 1,
        SOwner: 1,
        shopNo: 1,
        marketId: 1,
        status: 1,
        kyc_status: 1,
        Uid: 1,
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        type: 1,
        mobile: 1,
        active: 1,
        date: 1,
      },
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: [{ type: { $eq: 'market' } }, { marketId: { $eq: marketId } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    {
      $unwind: '$shoptype',
    },
    {
      $lookup: {
        from: 'marketclones',
        localField: 'marketId',
        foreignField: '_id',
        as: 'marketData',
      },
    },
    {
      $unwind: '$marketData',
    },
  ]);
  return { values: values, total: total.length };
};

const forgotPassword = async (body) => {
  // const { phoneNumber } = body;
  // await Textlocal.Otp(body);
  let users = await Users.findOne({ phoneNumber: body.mobileNumber });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  return await Textlocal.Otp(body, users);
};
const otpVerfiy = async (body) => {
  // const { phoneNumber } = body;
  // await Textlocal.Otp(body);
  let users = await Users.findOne({ phoneNumber: body.mobileNumber });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }

  return await Verfy.verfiy(body, users);
};

const getshopDataById = async (id) => {
  const shop = await Shop.findById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  if (shop.status == 'phone_approved' || shop.status == 'kyc_verified') {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Data Not Acceptable');
  } else {
    return shop;
  }
};

const perdeleteShopById = async (id) => {
  let shop = await getShopById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not Found');
  }
  shop = await Shop.findByIdAndDelete(id);
  return {
    message: 'Deleted',
  };
};

const getVendorShops = async (key) => {
  let values = await Shop.aggregate([
    {
      $match: {
        SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5',
        SType: '66077e16-aa5f-401f-abcc-e1842d151b14',
        SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5',
        SType: '57fdca99-9b2c-47aa-838b-eed600d3264a',
        SType: 'c974636a-6324-4426-9440-d599353c9a18',
        SType: '4372526e-266a-4474-a140-7e633015b15c',
        SType: '602e637e-11e8-4901-b80f-db8a467afda2',
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $or: [{ area: { $regex: key, $options: 'i' } }],
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $project: {
        _id: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        Slat: 1,
        Slong: 1,
        address: 1,
        Uid: 1,
        StreetName: '$streets.street',
        Area: '$streets.area',
      },
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5',
        SType: '66077e16-aa5f-401f-abcc-e1842d151b14',
        SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5',
        SType: '57fdca99-9b2c-47aa-838b-eed600d3264a',
        SType: 'c974636a-6324-4426-9440-d599353c9a18',
        SType: '4372526e-266a-4474-a140-7e633015b15c',
        SType: '602e637e-11e8-4901-b80f-db8a467afda2',
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $or: [{ area: { $regex: key, $options: 'i' } }],
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
  ]);
  return { values: values, total: total.length };
};

// getnotAssignSalesmanData

const getnotAssignSalesmanData = async (zone, id, street, page, limit, uid, date) => {
  date = date.split('-').reverse().join('-');
  let match;
  let zoneMatch;
  let wardMatch;
  let streetMatch;
  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }
  //console.log(zoneMatch);
  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }
  //console.log(wardMatch);
  if (street != 'null') {
    streetMatch = [{ _id: { $eq: street } }];
  } else {
    streetMatch = [{ active: { $eq: true } }];
  }
  //console.log(streetMatch);

  if (uid != 'null' && date == 'null') {
    match = [{ Uid: { $eq: uid } }];
  } else if (date != 'null' && uid == 'null') {
    match = [{ date: { $eq: date } }];
  } else if (uid != 'null' && date != 'null') {
    match = [{ Uid: { $eq: uid } }, { date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }

  // if (id != 'null' && uid != 'null' && date == 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }];
  // }
  // else if ( id != 'null' && uid == 'null' && date == 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Strid: { $eq: street } }];
  // }
  // else if ( id != 'null' && uid != 'null' && date == 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { Strid: { $eq: street } }];
  // }
  //  else if ( id != 'null' && uid != 'null' && date != 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }];
  // }
  //  else if ( id != 'null' && uid == 'null' && date != 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }];
  // }
  //  else if (id != 'null' && uid == 'null' && date != 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }, { Strid: { $eq: street } }];
  // }
  // else if ( id != 'null' && uid != 'null' && date != 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }, { Strid: { $eq: street } }];
  // }
  // else if(id =='null' && uid != 'null' && date == 'null' && street == 'null'){
  //   match = [{ Uid: { $eq: uid } }];
  // }
  //  else {
  //   match = [{ Wardid: { $eq: id } }];
  // }
  //console.log(match);
  let data = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: null } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
    {
      $project: {
        SOwner: 1,
        SName: 1,
        mobile: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        Uid: 1,
        date: 1,
        ward: '$wards.ward',
        Wardid: 1,
        zoneId: '$wards.zoneId',
        zone: '$zones.zone',
        streetId: '$streets._id',
        streetname: '$streets.street',
        locality: '$streets.locality',
        _id: 1,
        displaycount: 1,
      },
    },
    {
      $sort: { streetId: 1 },
    },
    {
      $skip: parseInt(limit) * parseInt(page),
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  let temp = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $eq: 'tempReassign' } },
              { salesManStatus: { $ne: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $eq: 'tempReassign' } },
              { salesManStatus: { $ne: null } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
  ]);
  let allnoAssing = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    // {
    //   $match: {
    //     $or: [
    //       { salesManStatus: { $ne: 'Assign' } },
    //       { salesManStatus: { $eq: null } },
    //       { salesManStatus: { $eq: 'Reassign' } },
    //       { salesManStatus: { $ne: 'tempReassign' } },
    //     ],
    //   },
    // },
    // {
    //   $match: {
    //     $or: [
    //       { $and: [{ salesManStatus: { $ne: 'Assign' }}, { salesManStatus: { $ne: 'tempReassign' } }, { salesManStatus: { $eq: 'Reassign' } }] },
    //       { $and: [{ salesManStatus: { $ne: 'Assign' }}, { salesManStatus: { $ne: 'tempReassign' } }, { salesManStatus: { $eq: null } }] },
    //     ],
    //   },
    // },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
    {
      $project: {
        SOwner: 1,
        SName: 1,
        mobile: 1,
        address: 1,
        locality: '$streets.locality',
        _id: 1,
        displaycount: 1,
      },
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    // {
    //   $match: {
    //     $or: [
    //       { salesManStatus: { $ne: 'Assign' } },
    //       { salesManStatus: { $eq: null } },
    //       { salesManStatus: { $eq: 'Reassign' } },
    //       { salesManStatus: { $ne: 'tempReassign' } },
    //     ],
    //   },
    // },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: null } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
    {
      $project: {
        SOwner: 1,
        SName: 1,
        mobile: 1,
        address: 1,
        locality: '$streets.locality',
        _id: 1,
        displaycount: 1,
      },
    },
  ]);
  let lat = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: null } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
    {
      $project: {
        // SOwner: 1,
        SName: 1,
        // mobile: 1,
        // address: 1,
        Slat: 1,
        Slong: 1,
        // Uid: 1,
        // date: 1,
        // ward: '$wards.ward',
        // Wardid: 1,
        // zoneId: '$wards.zoneId',
        // zone: '$zones.zone',
        // streetId: '$streets._id',
        // streetname: '$streets.street',
        // locality: '$streets.locality',
        // _id: 1,
        // displaycount: 1,
      },
    },
    // {
    //   $sort: { streetId: 1 },
    // },
    // {
    //   $skip: parseInt(limit) * parseInt(page),
    // },
    // {
    //   $limit: parseInt(limit),
    // },
  ]);
  return { data: data, total: total.length, overall: allnoAssing.length, temp: temp.length, lat: lat };
};

const GetShopsByShopType = async (id, page) => {
  //console.log(id);
  let match;
  if (id == 'null') {
    match = {
      $or: [
        {
          SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5',
        },
        {
          SType: '66077e16-aa5f-401f-abcc-e1842d151b14',
        },
        {
          SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5',
        },
        {
          SType: '57fdca99-9b2c-47aa-838b-eed600d3264a',
        },
        {
          SType: 'c974636a-6324-4426-9440-d599353c9a18',
        },
        {
          SType: '4372526e-266a-4474-a140-7e633015b15c',
        },
        {
          SType: '602e637e-11e8-4901-b80f-db8a467afda2',
        },
      ],
    };
  } else {
    match = { SType: { $eq: id } };
  }
  let shops = await Shop.aggregate([
    {
      $match: {
        $and: [match],
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        SName: 1,
        type: 1,
        SOwner: 1,
        mobile: 1,
        address: 1,
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: [match],
      },
    },
  ]);
  let totalcounts = await Shop.find({ SType: '66077e16-aa5f-401f-abcc-e1842d151b14' }).count();
  let totalcounts1 = await Shop.find({ SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5' }).count();
  let totalcounts2 = await Shop.find({ SType: '57fdca99-9b2c-47aa-838b-eed600d3264a' }).count();
  let totalcounts3 = await Shop.find({ SType: 'c974636a-6324-4426-9440-d599353c9a18' }).count();
  let totalcounts4 = await Shop.find({ SType: '4372526e-266a-4474-a140-7e633015b15c' }).count();
  let totalcounts5 = await Shop.find({ SType: '602e637e-11e8-4901-b80f-db8a467afda2' }).count();
  let totalcounts6 = await Shop.find({ SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5' }).count();
  let totalcount = totalcounts + totalcounts1 + totalcounts2 + totalcounts3 + totalcounts4 + totalcounts5 + totalcounts6;
  let shoptype = await ShopList.findById(id);
  return { shops: shops, total: total.length, totalcount: totalcount, shoptype: shoptype };
};

const GetShopsReviewsByShopType = async (id, page) => {
  let shops = await Shop.aggregate([
    {
      $match: {
        $and: [{ SType: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shopreviews',
        localField: '_id',
        foreignField: 'shopId',
        as: 'Reviews',
      },
    },
    // {
    //   $unwind: {
    //     path: '$Reviews',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        SName: 1,
        type: 1,
        SOwner: 1,
        mobile: 1,
        address: 1,
        reviews: '$Reviews',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: [{ SType: { $eq: id } }],
      },
    },
  ]);
  return { shops: shops, total: total.length };
};

const getShopReviewByShopid = async (id) => {
  let values = await Shop.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'shopreviews',
        localField: '_id',
        foreignField: 'shopId',
        as: 'Reviews',
      },
    },
    {
      $unwind: '$Reviews',
    },
    {
      $project: {
        _id: 1,
        SName: 1,
        reviewvId: '$Reviews._id',
        Rating: '$Reviews.Rating',
        Name: '$Reviews.Name',
        MobileNumber: '$Reviews.MobileNumber',
        Review: '$Reviews.Review',
      },
    },
  ]);
  return values;
};

const data1 = async () => {
  const data = await Shop.find({ salesManStatus: { $in: ['Reassign', 'Assign', 'tempReassign'] } });
  if (data.length != 0) {
    data.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e._id }, { salesManStatus: null }, { new: true });
      //console.log(e.salesManStatus);
    });
  }
  return { mesage: 'updated..' };
};

const data2 = async () => {
  const data = await Shop.find({ telecallerStatus: { $in: ['Reassign', 'Assign', 'tempReassign'] } });
  if (data.length != 0) {
    data.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e._id }, { telecallerStatus: null }, { new: true });
      //console.log(e.telecallerStatus);
    });
  }
  return { mesage: 'updated..' };
};

const data3 = async () => {
  const data = await Shop.find({ salesmanOrderStatus: { $in: ['Reassign', 'Assign', 'tempReassign'] } });
  if (data.length != 0) {
    data.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e._id }, { salesmanOrderStatus: null }, { new: true });
      //console.log(e.salesmanOrderStatus);
    });
  }
  return { mesage: 'updated..' };
};

const get_total_vendorShop = async (page) => {
  let values = await Shop.aggregate([
    {
      $match: {
        $or: [
          {
            SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5',
          },
          {
            SType: '66077e16-aa5f-401f-abcc-e1842d151b14',
          },
          {
            SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5',
          },
          {
            SType: '57fdca99-9b2c-47aa-838b-eed600d3264a',
          },
          {
            SType: 'c974636a-6324-4426-9440-d599353c9a18',
          },
          {
            SType: '4372526e-266a-4474-a140-7e633015b15c',
          },
          {
            SType: '602e637e-11e8-4901-b80f-db8a467afda2',
          },
        ],
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $or: [
          {
            SType: '07299efb-1aa4-40e6-ad5f-a03ffecdc0a5',
          },
          {
            SType: '66077e16-aa5f-401f-abcc-e1842d151b14',
          },
          {
            SType: '2d2a9e39-34a1-4dde-9767-a37251854cc5',
          },
          {
            SType: '57fdca99-9b2c-47aa-838b-eed600d3264a',
          },
          {
            SType: 'c974636a-6324-4426-9440-d599353c9a18',
          },
          {
            SType: '4372526e-266a-4474-a140-7e633015b15c',
          },
          {
            SType: '602e637e-11e8-4901-b80f-db8a467afda2',
          },
        ],
      },
    },
  ]);
  return { values: values, total: total.length };
};

// { salesManStatus: { $eq: 'Assign' } },
// { salesManStatus: { $eq: 'tempReassign' } },
const get_wardby_shops = async (query) => {
  let wardId = query.ward;
  let user = { active: true };
  if (query.users != '' && query.users != null && query.users != 'null') {
    user = { Uid: { $eq: query.users } };
  }
  // //console.log("hello")
  let shopss = await Shop.aggregate([
    {
      $match: {
        $and: [
          { Wardid: { $eq: wardId } },
          user,
          //  { salesManStatus: { $ne: 'Assign' } }, { salesManStatus: { $ne: 'tempReassign' } }
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },

    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [{ $match: { status: { $ne: 'Reassign' } } }, { $limit: 1 }],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: {
        path: '$salesmanshops',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    {
      $unwind: {
        path: '$b2bshopclones',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: '$shoptype.shopList',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        active: 1,
        mobile: 1,
        date: 1,
        displaycount: 1,
        salesManStatus: 1,
        assignedUser: '$salesmanshops.fromSalesManId',
        b2bshopclones: '$b2bshopclones',
      },
    },
  ]);

  let assign = await Shop.aggregate([
    {
      $match: {
        $and: [
          { Wardid: { $eq: wardId } },
          user,
          { $or: [{ salesManStatus: { $eq: 'tempReassign' } }, { salesManStatus: { $eq: 'Assign' } }] },
        ],
      },
    },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  let data_approved = await Shop.aggregate([
    { $match: { $and: [user, { Wardid: { $eq: wardId } }, { status: { $eq: 'data_approved' } }] } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  // //console.log(assign)
  // //console.log(data_approved)
  assign = assign.length == 0 ? 0 : assign[0].count;
  data_approved = data_approved.length == 0 ? 0 : data_approved[0].count;
  // //console.log(assign)
  // //console.log(data_approved)

  return { shopss: shopss, data_approved: data_approved, assign: assign };
};

const update_pincode = async (query, body) => {
  let shop = await Shop.findByIdAndUpdate(
    { _id: query.id },
    { Pincode: body.pincode, da_landmark: body.da_landmark },
    { new: true }
  );
  return shop;
};
const update_pincode_map = async (query, body) => {
  let shop = await Shop.findByIdAndUpdate({ _id: query.id }, { Pincode: body.pincode }, { new: true });
  return shop;
};
const gomap_view_now = async (id) => {
  let shop = await Shop.findByIdAndUpdate({ _id: id }, { gomap: moment() }, { new: true });
  return shop;
};

const ward_by_users = async (query) => {
  const page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let user = { active: true };
  if (query.users != 'null' && query.users != null && query.users != '') {
    user = { Uid: { $eq: query.users } };
  }
  let shop = await Shop.aggregate([
    {
      $match: { $and: [user] },
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zones',
            },
          },
          {
            $unwind: '$zones',
          },
          {
            $lookup: {
              from: 'districts',
              localField: 'district',
              foreignField: '_id',
              as: 'districts',
            },
          },
          {
            $unwind: '$districts',
          },
          {
            $project: {
              ward: 1,
              _id: 1,
              zone: '$zones.zone',
              zoneCode: '$zones.zoneCode',
              district: '$districts.district',
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $group: {
        _id: {
          Wardid: '$Wardid',
          ward: '$wards.ward',
          zone: '$wards.zone',
          zoneCode: '$wards.zoneCode',
          district: '$wards.district',
        },
      },
    },
    {
      $project: {
        _id: '$_id.Wardid',
        Wardid: '$_id.Wardid',
        ward: '$_id.ward',
        zone: '$_id.zone',
        zoneCode: '$_id.zoneCode',
        districtName: '$_id.district',
      },
    },
    {
      $sort: { ward: 1 },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  return shop;
};

const getnotAssignSalesmanDataMap = async (zone, id, street, uid, date) => {
  date = date.split('-').reverse().join('-');
  let match;
  let zoneMatch;
  let wardMatch;
  let streetMatch;
  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }
  //console.log(zoneMatch);
  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }
  //console.log(wardMatch);
  if (street != 'null') {
    streetMatch = [{ _id: { $eq: street } }];
  } else {
    streetMatch = [{ active: { $eq: true } }];
  }
  //console.log(streetMatch);

  if (uid != 'null' && date == 'null') {
    match = [{ Uid: { $eq: uid } }];
  } else if (date != 'null' && uid == 'null') {
    match = [{ date: { $eq: date } }];
  } else if (uid != 'null' && date != 'null') {
    match = [{ Uid: { $eq: uid } }, { date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }

  // if (id != 'null' && uid != 'null' && date == 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }];
  // }
  // else if ( id != 'null' && uid == 'null' && date == 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Strid: { $eq: street } }];
  // }
  // else if ( id != 'null' && uid != 'null' && date == 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { Strid: { $eq: street } }];
  // }
  //  else if ( id != 'null' && uid != 'null' && date != 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }];
  // }
  //  else if ( id != 'null' && uid == 'null' && date != 'null' && street == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }];
  // }
  //  else if (id != 'null' && uid == 'null' && date != 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }, { Strid: { $eq: street } }];
  // }
  // else if ( id != 'null' && uid != 'null' && date != 'null' && street != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }, { Strid: { $eq: street } }];
  // }
  // else if(id =='null' && uid != 'null' && date == 'null' && street == 'null'){
  //   match = [{ Uid: { $eq: uid } }];
  // }
  //  else {
  //   match = [{ Wardid: { $eq: id } }];
  // }
  // //console.log(match);
  let data = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesManStatus: { $ne: 'Assign' } },
              { salesManStatus: { $ne: 'tempReassign' } },
              { salesManStatus: { $eq: null } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: streetMatch,
            },
          },
        ],
        as: 'streets',
      },
    },
    {
      $unwind: '$streets',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: wardMatch,
            },
          },
        ],
        as: 'wards',
      },
    },
    {
      $unwind: '$wards',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wards.zoneId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: zoneMatch,
            },
          },
        ],
        as: 'zones',
      },
    },
    {
      $unwind: '$zones',
    },
    {
      $project: {
        // SOwner: 1,
        // SName: 1,
        // mobile: 1,
        // address: 1,
        Slat: 1,
        Slong: 1,
        // Uid: 1,
        // date: 1,
        // ward: '$wards.ward',
        // Wardid: 1,
        // zoneId: '$wards.zoneId',
        // zone: '$zones.zone',
        // streetId: '$streets._id',
        // streetname: '$streets.street',
        // locality: '$streets.locality',
        // _id: 1,
        // displaycount: 1,
      },
    },
    // {
    //   $sort: { streetId: 1 },
    // },
  ]);
  return data;
};

const get_userbased_dataapproved = async (query) => {
  let userId = query.user;
  let date = query.date;
  //console.log(userId);
  //console.log(date);
  const shops = await Shop.aggregate([
    { $sort: { DA_CREATED: 1 } },
    {
      $match: {
        $and: [{ DA_USER: { $eq: userId } }, { DA_DATE: { $eq: date } }, { status: { $eq: 'data_approved' } }],
      },
    },
  ]);
  let returns = [];
  let lat;
  let long;
  for (let i = 0; i < shops.length; i++) {
    if (shops[i].distanceStatus != 'updated') {
      let response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
          shops[i].Slat + ',' + shops[i].Slong
        }&destinations=${shops[i].da_lot + ',' + shops[i].da_long}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
      );
      if (i == 0) {
        lat = shops[i].Slat;
        long = shops[i].Slong;
      }
      let dis = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat + ',' + long}&destinations=${
          shops[i].Slat + ',' + shops[i].Slong
        }&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
      );
      // //console.log(dis.data.rows[0].elements[0].distance.text);
      // //console.log(dis.data.rows[0].elements[0].duration.text);
      if (response != null) {
        returns.push({
          ...shops[i],
          ...{
            distance: response.data.rows[0].elements[0].distance.text,
            duration: response.data.rows[0].elements[0].duration.text,
            da_distance: dis.data.rows[0].elements[0].distance.text,
            da_duration: dis.data.rows[0].elements[0].duration.text,
          },
        });
        await Shop.findByIdAndUpdate(
          { _id: shops[i]._id },
          {
            da_distance: dis.data.rows[0].elements[0].distance.text,
            distance: response.data.rows[0].elements[0].distance.text,
            distanceStatus: 'updated',
          },
          { new: true }
        );
      }
    } else {
      returns.push(shops[i]);
    }
    lat = shops[i].Slat;
    long = shops[i].Slong;
  }
  // //console.log(returns);
  return { returns: returns };
  // return shops;
};

const managemap_data_approved = async (query) => {
  let userId = [{ active: true }];
  let dastatus = { active: true };
  let dateMatch = { active: true };
  let userMatch = { active: true };
  if (query.status != null && query.status != '' && query.status != 'null') {
    dastatus = { daStatus: { $eq: query.status } };
  }
  if (query.date != null && query.date != '' && query.date != 'null') {
    let date = query.date.split(',');
    let startdate = date[0];
    let enddata = date[1];
    dateMatch = { $and: [{ DA_DATE: { $gte: startdate } }, { DA_DATE: { $lte: enddata } }] };
  }
  if (query.capture != null && query.capture != '' && query.capture != 'null') {
    userMatch = { Uid: { $eq: query.capture } };
  }
  if (query.uid != null && query.uid != '' && query.uid != 'null') {
    userId = [
      { salesManId: query.uid, fromSalesManId: query.uid, status: 'Assign' },
      { salesManId: query.uid, status: 'tempReassign' },
    ];
  }

  let values = await Shop.aggregate([
    {
      $match: {
        $or: [
          { salesManStatus: { $eq: 'Assign' } },
          { salesManStatus: { $eq: 'tempReassign' } },
          { salesManStatus: { $eq: 'Reassign' } },
        ],
        $and: [dastatus, dateMatch, userMatch],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $or: userId,
            },
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        DA_Comment: 1,
        daStatus: 1,
        da_lot: 1,
        da_long: 1,
        DA_DATE: 1,
        DA_USER: 1,
        DA_CREATED: 1,
        DA_TIME: 1,
        da_landmark: 1,
        salesmanOrderStatus: 1,
        Pincode: 1,
        distance: 1,
        da_distance: 1,
        distanceStatus: 1,
      },
    },
  ]);
  return values;
};

const reverifiction_byshop = async (query, userId) => {
  let page = query.page == '' || query.page == null || query.page == 'null' ? 0 : query.page;
  //console.log(page);
  let values = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] },
              },
              {
                Uid: { $eq: userId },
              },
            ],
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] },
              },
              {
                re_Uid: { $eq: userId },
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        Re_daStatus: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] },
              },
              {
                Uid: { $eq: userId },
              },
            ],
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] },
              },
              {
                re_Uid: { $eq: userId },
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },
  ]);
  return {
    values: values,
    total: total.length,
  };
};

const get_reassign_temp = async (query) => {
  //console.log(query);
  let page = query.page == null || query.page == 'null' || query.page == '' ? 0 : query.page;
  let assignby = { active: true };
  if (query.assign != null && query.assign != 'null' && query.assign != '') {
    assignby = { DA_USER: { $ne: query.assign } };
  }
  let statusMatch = { $in: ['Not Interested', 'Cannot Spot the Shop'] };
  if (query.status != '' && query.status != null && query.status != 'null') {
    statusMatch = { $eq: query.status };
  }
  let zoneMatch = { active: true };
  if (query.zone != '' && query.zone != null && query.zone != 'null') {
    zoneMatch = { _id: { $eq: query.zone } };
  }
  let wardMatch = { active: true };
  if (query.ward != '' && query.ward != null && query.ward != 'null') {
    wardMatch = { Wardid: { $eq: query.ward } };
  }
  let capture = query.capture;
  //console.log(wardMatch);
  //console.log(zoneMatch);

  let values = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $and: [
          {
            daStatus: statusMatch,
          },
          {
            Uid: { $eq: capture },
          },
          { re_Uid: { $eq: null } },
          assignby,
          wardMatch,
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              pipeline: [{ $match: { $and: [zoneMatch] } }],
              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved',
      },
    },
    {
      $unwind: '$data_approved',
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        Re_daStatus: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_CREATED: 1,
        DA_USERNAME: '$data_approved.name',
        purchaseQTy: 1,
        da_lot: 1,
        da_long: 1,
        da_landmark: 1,
        Pincode: 1,
        daStatus: 1,
        DA_USER: 1,
        Wardid: 1,
      },
    },
  ]);

  return { values: values };
};

const update_reassign_temp = async (body) => {
  //console.log(body);

  body.arr.forEach(async (e) => {
    await Shop.findByIdAndUpdate({ _id: e }, { re_Uid: body.assign, reAssigin_date: moment() }, { new: true });
  });

  return { status: 'success' };
};

const get_data_approved_date = async (query) => {
  let user = query.id;
  //console.log(user);
  let shop = await Shop.aggregate([
    { $match: { $and: [{ DA_USER: { $eq: user } }] } },
    {
      $project: {
        _id: 1,
        SOwner: 1,
        SName: 1,
        created: 1,
        filterDate: 1,
        Slong: 1,
        Slat: 1,
        address: 1,
        daStatus: 1,
        status: 1,
      },
    },
  ]);
  return shop;
};

const get_data_approved_details = async (query) => {
  const page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let userMatch = { active: true };
  let daterange = { active: true };
  let statusMatch = { Re_daStatus: { $ne: null } };
  if (query.user != null && query.user != '' && query.user != 'null') {
    userMatch = { $or: [{ re_Uid: { $eq: query.user } }, { Uid: { $eq: query.user } }] };
  }
  if (query.status != null && query.status != '' && query.status != 'null') {
    statusMatch = { Re_daStatus: { $eq: query.status } };
  }
  if (query.date != null && query.date != '' && query.date != 'null') {
    let date = query.date.split(',');
    let startdate = date[0];
    let enddata = date[1];
    daterange = { $and: [{ Re_DA_DATE: { $gte: startdate } }, { Re_DA_DATE: { $lte: enddata } }] };
  }
  let shop = await Shop.aggregate([
    { $match: { $and: [userMatch, daterange, statusMatch] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved',
      },
    },
    {
      $unwind: '$data_approved',
    },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'Re_DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved_re',
      },
    },
    {
      $unwind: '$data_approved_re',
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        Re_daStatus: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_CREATED: 1,
        DA_USERNAME: '$data_approved.name',
        purchaseQTy: 1,
        da_lot: 1,
        da_long: 1,
        da_landmark: 1,
        Pincode: 1,
        daStatus: 1,
        DA_USER: 1,
        Re_DA_USER: 1,
        Wardid: 1,
        Re_DA_CREATED: 1,
        Re_DA_Comment: 1,
        Re_DA_DATE: 1,
        Re_DA_TIME: 1,
        Re_DA_CREATED: 1,
        Re_DA_USERNAME: '$data_approved_re.name',
        Re_purchaseQTy: 1,
        Re_da_lot: 1,
        Re_da_long: 1,
        Re_da_landmark: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await Shop.aggregate([
    { $match: { $and: [userMatch, daterange, statusMatch] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved',
      },
    },
    {
      $unwind: '$data_approved',
    },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'Re_DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved_re',
      },
    },
    {
      $unwind: '$data_approved_re',
    },
  ]);
  return { value: shop, total: total.length };
};

const get_updated_pincode = async () => {
  let shop = await Shop.aggregate([
    { $match: { $and: [{ status: { $eq: 'data_approved' } }, { Pincode: { $ne: null } }] } },
    {
      $group: {
        _id: { Pincode: '$Pincode' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 'aa',
        Pincode: '$_id.Pincode',
        count: 1,
      },
    },
    { $sort: { Pincode: 1 } },
  ]);

  return shop;
};

const get_shop_in_pincode = async (query) => {
  let pincode = { active: true };
  let status = { active: true };
  // query.status;
  let approved = { active: true };
  // query.approved;
  if (query.pincode != null && query.pincode != 'null' && query.pincode != '') {
    pincode = { Pincode: { $eq: parseInt(query.pincode) } };
  }
  if (query.status != null && query.status != 'null' && query.status != '') {
    status = { daStatus: { $eq: query.status } };
  }
  if (query.approved != null && query.approved != 'null' && query.approved != '') {
    approved = { DA_USER: { $eq: query.approved } };
  }
  let shop = await Shop.aggregate([
    { $match: { $and: [{ status: { $eq: 'data_approved' } }, approved, status, pincode] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved',
      },
    },
    {
      $unwind: {
        path: '$data_approved',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Re_DA_USER',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'data_approved_re',
      },
    },
    {
      $unwind: {
        path: '$data_approved_re',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        Re_daStatus: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_CREATED: 1,
        DA_USERNAME: '$data_approved.name',
        purchaseQTy: 1,
        da_lot: 1,
        da_long: 1,
        da_landmark: 1,
        Pincode: 1,
        daStatus: 1,
        DA_USER: 1,
        Re_DA_USER: 1,
        Wardid: 1,
        Re_DA_CREATED: 1,
        Re_DA_Comment: 1,
        Re_DA_DATE: 1,
        Re_DA_TIME: 1,
        Re_DA_CREATED: 1,
        Re_DA_USERNAME: '$data_approved_re.name',
        Re_purchaseQTy: 1,
        Re_da_lot: 1,
        Re_da_long: 1,
        Re_da_landmark: 1,
      },
    },
  ]);

  return shop;
};

const getindividualSupplierAttendence = async (user, date, page) => {
  //console.log(user);
  let userFilter = [{ active: true }];
  if (user !== 'null') {
    userFilter = [{ Uid: { $eq: user } }];
  }
  let dateMatch = { active: true };
  if (date !== 'null') {
    dateMatch = { date: date };
  }
  let values = await AttendanceClonenew.aggregate([
    {
      $match: {
        $and: [dateMatch],
      },
    },
    {
      $sort: { date: -1, time: -1 },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [{ $match: { userRole: '3fd66c17-d85b-4cd4-af96-ac8173d8a830' } }],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        active: 1,
        archive: 1,
        Alat: 1,
        Along: 1,
        image: 1,
        date: 1,
        time: 1,
        created: 1,
        Uid: 1,
        userName: '$UsersData.name',
        phoneNumber: '$UsersData.phoneNumber',
        email: '$UsersData.email',
        createdAt: 1,
      },
    },
    {
      $match: { $and: userFilter },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await AttendanceClonenew.aggregate([
    {
      $match: {
        $and: [dateMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [{ $match: { userRole: '3fd66c17-d85b-4cd4-af96-ac8173d8a830' } }],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        active: 1,
        archive: 1,
        Alat: 1,
        Along: 1,
        image: 1,
        date: 1,
        time: 1,
        created: 1,
        Uid: 1,
        userName: '$UsersData.name',
      },
    },
    {
      $match: { $and: userFilter },
    },
  ]);
  return { values: values, total: total.length };
};

const HighlyIntrestedShops = async (type) => {
  let typeMatch;
  //console.log(type);
  if (type == 'ModeratelyInterested') {
    typeMatch = { daStatus: 'ModeratelyInterested', status: 'data_approved' };
  } else if (type == 'both') {
    typeMatch = { daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] } };
  } else {
    typeMatch = { daStatus: 'HighlyInterested', status: 'data_approved' };
  }
  let values = await Shop.aggregate([
    {
      $match: { $and: [typeMatch] },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        as: 'ApprovedUsersData',
      },
    },
    {
      $unwind: '$ApprovedUsersData',
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        status: 1,
        kyc_status: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        Slong: 1,
        address: 1,
        created: 1,
        date: 1,
        time: 1,
        Uid: 1,
        callingUserId: 1,
        sorttime: 1,
        sortdate: 1,
        filterDate: 1,
        historydate: 1,
        salesManStatus: 1,
        displaycount: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_USER: 1,
        Pincode: 1,
        daStatus: 1,
        da_landmark: 1,
        da_long: 1,
        da_lot: 1,
        purchaseQTy: 1,
        kapturedUser: '$UsersData.name',
        kapturedUserContact: '$UsersData.phoneNumber',
        kapturedUseremail: '$UsersData.email',
        kapturedUsersalary: '$UsersData.salary',
        dataApprovedUser: '$ApprovedUsersData.name',
        dataApprovedUserContact: '$ApprovedUsersData.phoneNumber',
        dataApprovedUseremail: '$ApprovedUsersData.email',
        dataApprovedUserSalary: '$ApprovedUsersData.salary',
        changeMap: { $ifNull: ['$changeMap', false] },
      },
    },
    {
      $match: { changeMap: { $eq: false } },
    },
  ]);
  return values;
};
// changeMap chLat chLong
const ChangeOneMap_to_AnotherMap = async (body) => {
  const { arr, revert } = body;
  let len = arr.length;
  if (len <= 0) {
    throw new ApiError(httpStatus[400], 'Select Shops');
  }
  if (revert === 1) {
    arr.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e }, { changeMap: true }, { new: true });
    });
    return { Message: 'SuccesFully Changed' };
  }
  arr.forEach(async (e) => {
    await Shop.findByIdAndUpdate({ _id: e }, { changeMap: false }, { new: true });
  });
  return { Message: 'SuccesFully Changed' };
};

const getRevertShops = async () => {
  let values = await Shop.aggregate([
    {
      $match: { changeMap: true },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        as: 'ApprovedUsersData',
      },
    },
    {
      $unwind: '$ApprovedUsersData',
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        status: 1,
        kyc_status: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        Slong: 1,
        address: 1,
        created: 1,
        date: 1,
        time: 1,
        Uid: 1,
        callingUserId: 1,
        sorttime: 1,
        sortdate: 1,
        filterDate: 1,
        historydate: 1,
        salesManStatus: 1,
        displaycount: 1,
        DA_CREATED: 1,
        DA_Comment: 1,
        DA_DATE: 1,
        DA_TIME: 1,
        DA_USER: 1,
        Pincode: 1,
        daStatus: 1,
        da_landmark: 1,
        da_long: 1,
        da_lot: 1,
        purchaseQTy: 1,
        kapturedUser: '$UsersData.name',
        kapturedUserContact: '$UsersData.phoneNumber',
        kapturedUseremail: '$UsersData.email',
        kapturedUsersalary: '$UsersData.salary',
        dataApprovedUser: '$ApprovedUsersData.name',
        dataApprovedUserContact: '$ApprovedUsersData.phoneNumber',
        dataApprovedUseremail: '$ApprovedUsersData.email',
        dataApprovedUserSalary: '$ApprovedUsersData.salary',
        changeMap: 1,
        dummySort: 1,
      },
    },
    {
      $sort: { dummySort: 1 },
    },
  ]);
  return values;
};

const DummySort = async (body) => {
  let count = 0;
  const { arr } = body;
  arr.forEach(async (e) => {
    count = count + 1;
    await Shop.findByIdAndUpdate({ _id: e._id }, { dummySort: count }, { new: true });
  });
  return { Message: 'Sucess' };
};

const getShopByPincode = async (pincode) => {
  //console.log(pincode);
  let code = parseInt(pincode);
  let shop = await Shop.aggregate([
    {
      $match: { $and: [{ daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] }, Pincode: { $ne: code } }] },
    },
  ]);
  return shop;
};

const finalmap_view = async (req) => {
  let status = {
    $or: [
      { $and: [{ daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] } }] },
      { $and: [{ Re_daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] } }] },
    ],
  };
  if (req.query.status != '' && req.query.status != null && req.query.status != 'null') {
    status = {
      $or: [{ $and: [{ daStatus: { $eq: req.query.status } }] }, { $and: [{ Re_daStatus: { $eq: req.query.status } }] }],
    };
  }
  if (
    req.query.pincode != null &&
    req.query.pincode != '' &&
    req.query.pincode != 'null' &&
    req.query.status != '' &&
    req.query.status != null &&
    req.query.status != 'null'
  ) {
    req.query.pincode = parseInt(req.query.pincode);
    //console.log(req.query.pincode, 2);

    status = {
      $or: [
        { $and: [{ daStatus: { $eq: req.query.status } }, { Pincode: { $eq: req.query.pincode } }] },
        { $and: [{ Re_daStatus: { $eq: req.query.status } }, { Re_Pincode: { $eq: req.query.pincode } }] },
      ],
    };
  } else if (req.query.pincode != null && req.query.pincode != '' && req.query.pincode != 'null') {
    req.query.pincode = parseInt(req.query.pincode);
    //console.log(req.query.pincode, 3);

    status = { $or: [{ Pincode: { $eq: req.query.pincode } }, { Re_Pincode: { $eq: req.query.pincode } }] };
  }
  let shop = await Shop.aggregate([
    {
      $match: { $and: [status] },
    },
  ]);
  return shop;
};

const finalmap_view_picode = async (req) => {
  let status = {
    $or: [
      { $and: [{ daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] } }] },
      { $and: [{ Re_daStatus: { $in: ['ModeratelyInterested', 'HighlyInterested'] } }] },
    ],
  };
  let shop = await Shop.aggregate([
    {
      $match: { $and: [status] },
    },
    {
      $addFields: {
        newpin: { $ifNull: ['$Re_Pincode', '$Pincode'] },
      },
    },
    {
      $group: {
        _id: { Pincode: '$newpin' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 'aa',
        Pincode: '$_id.Pincode',
        count: 1,
      },
    },
    { $sort: { Pincode: 1 } },
  ]);
  return shop;
};

const get_final_customer_shops = async (req) => {
  let page = req.query.page == '' || req.query.page == null ? 0 : parseInt(req.query.page);
  // match for filters

  let salesMatch = { active: true };
  let dateMatch = { active: true };
  let statusMatch = { active: true };
  if (req.query.sales && req.query.sales != 'null') {
    salesMatch = { customer_final_USER: req.query.sales };
  }

  if (req.query.date1 && req.query.date2) {
    if (req.query.date1 == 'null' || req.query.date2 == 'null') {
      statusMatch;
    } else {
      //console.log(req.query.date1, req.query.date2);
      dateMatch = { customer_final_date: { $gte: req.query.date1, $lte: req.query.date2 } };
    }
  }
  if (req.query.status && req.query.status != 'null') {
    if (req.query.status == '1') {
      statusMatch = { new_re_approve: 'Recognised & Fence Sitter' };
    } else if (req.query.status == '2') {
      statusMatch = { new_re_approve: 'Recognised & Interested' };
    } else if (req.query.status == '3') {
      statusMatch = { new_re_approve: 'Shop Closed/ Shifted' };
    } else if (req.query.status == '4') {
      statusMatch = { new_re_approve: 'Cannot Spot the shop' };
    } else if (req.query.status == '5') {
      statusMatch = { new_re_approve: 'Not interested' };
    } else if (req.query.status == '6') {
      statusMatch = { new_re_approve: 'Irrelevant Shop' };
    } else {
      statusMatch;
    }
  }

  let shop = await Shop.aggregate([
    { $sort: { customer_final_CREATED: -1 } },
    {
      $match: {
        $and: [{ new_re_approve: { $ne: null } }, salesMatch, dateMatch, statusMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              ward: 1,
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoptype',
      },
    },
    {
      $unwind: '$shoptype',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'customer_final_USER',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: '$shoptype.shopList',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        active: 1,
        mobile: 1,
        date: 1,
        customer_final_date: 1,
        customer_final_USER: 1,
        customer_final_CREATED: 1,
        customer_final_TIME: 1,
        new_re_long: 1,
        new_re_lat: 1,
        new_re_approve: 1,
        Pincode: 1,
        customer_final_approved_user: '$b2busers.name',
        da_long: 1,
        da_lot: 1,
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let next = await Shop.aggregate([
    {
      $match: { $and: [{ new_re_approve: { $ne: null } }] },
    },
    { $skip: 10 * (page + 1) },
    { $limit: 10 },
  ]);
  return { shop, next: next.length != 0 };
};

const getSalesExecutives = async () => {
  let values = await Users.aggregate([
    {
      $match: {
        userRole: 'fb0dd028-c608-4caa-a7a9-b700389a098d',
      },
    },
  ]);
  return values;
};

module.exports = {
  createShopClone,
  getAllShopClone,
  getShopById,
  updateShopById,
  deleteShopById,
  filterShopwithNameAndContact,
  // Attendace exports
  createAttendanceClone,
  getAllAttendanceClone,
  getAttendanceById,
  getshopWardStreetNamesWithAggregation,
  updateAttendanceById,
  deleteAttendanceById,
  totalCount,
  // get marketShop
  getMarkeShop,
  craeteRegister,
  getStreetAndShopDetails,
  forgotPassword,
  otpVerfiy,
  verifyRegisterOTP,
  updateShopStatus,
  getAllAttendanceCloneforMapView,
  getshopDataById,
  getshopWardStreetNamesWithAggregation_withfilter,
  getshopWardStreetNamesWithAggregation_withfilter_daily,
  getshopWardStreetNamesWithAggregation_withfilter_all,
  getshopWardStreetNamesWithAggregation_withfilter_daily_all,
  perdeleteShopById,
  createAttendanceClone_new,
  searchShops,
  getVendorShops,
  getnotAssignSalesmanData,
  GetShopsByShopType,
  GetShopsReviewsByShopType,
  getShopReviewByShopid,
  data1,
  getshop_myshops,
  getshop_myshops_asm,
  insertOrder,
  get_total_vendorShop,
  searchShops_By_Name,
  data2,
  data3,
  get_wardby_shops,
  update_pincode,
  gomap_view_now,
  ward_by_users,
  getnotAssignSalesmanDataMap,
  get_userbased_dataapproved,
  managemap_data_approved,
  reverifiction_byshop,
  update_reverification,
  get_reassign_temp,
  update_reassign_temp,
  get_data_approved_date,
  get_data_approved_details,
  get_updated_pincode,
  get_shop_in_pincode,
  update_pincode_map,
  getindividualSupplierAttendence,
  // bharathiraja
  HighlyIntrestedShops,
  ChangeOneMap_to_AnotherMap,
  getRevertShops,
  DummySort,
  getShopByPincode,
  finalmap_view,
  finalmap_view_picode,
  update_reverification_custmer,
  get_final_customer_shops,
  getSalesExecutives,
};
