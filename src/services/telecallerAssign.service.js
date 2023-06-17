const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Roles } = require('../models');
const { Shop } = require('../models/b2b.ShopClone.model');
const { Telecallerteam, TelecallerShop, SalesmanOrder, SalesmanOrderShop } = require('../models/telecallerAssign.model');
const { Users } = require('../models/B2Busers.model');
const Ward = require('../models/ward.model');
const moment = require('moment');
const e = require('express');
const createtelecallerAssignReassign = async (body) => {
  let { arr } = body;
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Users.findByIdAndUpdate({ _id: e }, { telecallerStatus: body.status }, { new: true });
      await Telecallerteam.create({
        telecallerHeadId: body.telecallerHeadId,
        telecallerteamId: e,
        status: body.status,
        date: serverdate,
        time: time,
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await Telecallerteam.find({
        telecallerHeadId: body.telecallerHeadId,
        telecallerteamId: e,
        status: 'Assign',
      });
      data.forEach(async (f) => {
        await Users.findByIdAndUpdate({ _id: f.telecallerteamId }, { telecallerStatus: body.status }, { new: true });
        await Telecallerteam.findByIdAndUpdate(
          { _id: f._id },
          {
            telecallerHeadId: f.telecallerHeadId,
            telecallerteamId: f.telecallerteamId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  }
  return 'created';
};

const getAllTelecallerHead = async () => {
  let data = await Users.find({ userRole: 'ae601146-dadd-443b-85b2-6c0fbe9f964c', active: true }).select(
    'name email userRole'
  );
  if (data.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  return data;
};

const getUnassignedtelecaller = async (page) => {
  let data = await Users.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              { userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } },
              { telecallerStatus: { $eq: 'Reassign' } },
              { active: { $eq: true } },
            ],
          },
          {
            $and: [
              { userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } },
              { telecallerStatus: { $eq: null } },
              { active: { $eq: true } },
            ],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              { userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } },
              { telecallerStatus: { $eq: 'Reassign' } },
              { active: { $eq: true } },
            ],
          },
          {
            $and: [
              { userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } },
              { telecallerStatus: { $eq: null } },
              { active: { $eq: true } },
            ],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);
  let overall = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);

  let Assingned = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }, { telecallerStatus: { $eq: 'Assign' } }],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);

  return { data: data, total: total.length, overAll: overall.length, Assingned: Assingned.length };
};

const gettelecallerheadTelecaller = async (id) => {
  const name = await Users.findById(id);
  let data = await Telecallerteam.aggregate([
    {
      $match: {
        $and: [{ telecallerHeadId: { $eq: id } }, { status: { $eq: 'Assign' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'telecallerteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'telecallershops',
        let: {
          localField: '$telecallerteamId',
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$telecallerteamId', '$$localField'] } } },
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project: {
        salesmanname: '$b2busersData.name',
        telecallerteamId: 1,
        status: 1,
        telecallerHeadId: 1,
        date: 1,
        time: 1,
        _id: 1,
        Count: { $size: '$b2bshopclonesdata' },
      },
    },
  ]);
  return { data: data, name: name.name };
};

const createTelecallerShop = async (body) => {
  let { arr } = body;
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let creat = moment().format('yyy-MM-DD');
  let creat1 = moment().format('HHmmss');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e }, { telecallerStatus: body.status }, { new: true });
      await TelecallerShop.create({
        telecallerteamId: body.telecallerteamId,
        shopId: e,
        status: body.status,
        fromtelecallerteamId: body.fromtelecallerteamId,
        time: time,
        date: serverdate,
        created: creat,
        createdTime: creat1,
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await TelecallerShop.find({
        telecallerteamId: body.telecallerteamId,
        shopId: e,
        status: { $in: ['Assign', 'tempReassign'] },
      });
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { telecallerStatus: body.status }, { new: true });
        await TelecallerShop.findByIdAndUpdate(
          { _id: f._id },
          {
            telecallerteamId: f.telecallerteamId,
            fromtelecallerteamId: f.fromtelecallerteamId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  }
  return 'created';
};

const getAllTelecaller = async () => {
  const data = await Users.find({ userRole: '33a2ff87-400c-4c15-b607-7730a79b49a9', active: true }).select(
    'name email phoneNumber userRole'
  );
  return data;
};

const getTelecallerAssignedShops = async (id) => {
  const name = await Users.findById(id);
  let data = await TelecallerShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromtelecallerteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ telecallerteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'telecallerteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        telecallerName: '$b2busersData.name',
        salesManId: 1,
        fromtelecallerteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  let total = await TelecallerShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromtelecallerteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ telecallerteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'telecallerteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        telecallerName: '$b2busersData.name',
        salesManId: 1,
        fromtelecallerteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  let lastdata = await TelecallerShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromtelecallerteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $group: {
        _id: { createdTime: '$createdTime', created: '$created' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        date: '$_id.created',
        createdTime: '$_id.createdTime',
        count: 1,
      },
    },
    {
      $sort: { date: -1, createdTime: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  return { data: data, telecallerName: name.name, count: total.length, lastdata };
};

const getnotAssignShops = async (zone, id, street, page, limit, uid, date, dastatus, pincode) => {
  let match;
  let zoneMatch;
  let wardMatch;
  let streetMatch;
  let dastatusMatch;
  let pincodeMatch;
  if (dastatus != 'null') {
    dastatusMatch = [{ daStatus: { $eq: dastatus } }];
  } else {
    dastatusMatch = [{ active: { $eq: true } }];
  }
  if (pincode != 'null') {
    pincodeMatch = [{ Pincode: { $eq: parseInt(pincode) } }];
  } else {
    pincodeMatch = [{ active: { $eq: true } }];
  }
  // //console.log(pincodeMatch)
  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }
  // //console.log(zoneMatch)
  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }
  //  //console.log(wardMatch)
  if (street != 'null') {
    streetMatch = [{ _id: { $eq: street } }];
  } else {
    streetMatch = [{ active: { $eq: true } }];
  }
  // //console.log(streetMatch)

  if (uid != 'null' && date == 'null') {
    match = [{ Uid: { $eq: uid } }];
  } else if (date != 'null' && uid == 'null') {
    match = [{ date: { $eq: date } }];
  } else if (uid != 'null' && date != 'null') {
    match = [{ Uid: { $eq: uid } }, { date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }

  // let match;
  // if (uid != 'null' && date == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }];
  // } else if (uid != 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }];
  // } else if (uid == 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }];
  // } else {
  //   match = [{ Wardid: { $eq: id } }];
  // }
  // //console.log(match)
  let data = await Shop.aggregate([
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
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
        // $and: [
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: 'Reassign' } },
        //   ],
        // },
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: null } },
        //   ],
        // },
        // ],
        telecallerStatus: { $nin: ['Assign', 'tempReassign', 'Reassign'] },
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
        Pincode: 1,
        salesmanOrderStatus: 1,
      },
    },
    { $match: { salesmanOrderStatus: { $nin: ['Assign'] } } },
    {
      $skip: parseInt(limit) * parseInt(page),
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  let allnoAssing = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
      },
    },
    {
      $match: {
        $and: pincodeMatch,
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
    { $match: { salesmanOrderStatus: { $nin: ['Assign'] } } },
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
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
        // $and: [
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: 'Reassign' } },
        //   ],
        // },
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: null } },
        //   ],
        // },
        // ],
        telecallerStatus: { $nin: ['Assign', 'tempReassign', 'Reassign'] },
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
        Pincode: 1,
        salesmanOrderStatus: 1,
      },
    },
    { $match: { salesmanOrderStatus: { $nin: ['Assign'] } } },
  ]);
  return { data: data, total: total.length, overall: allnoAssing.length };
};

const getnotAssignShops_without_Page = async (zone, id, street, uid, date, dastatus, pincode) => {
  let match;
  let zoneMatch;
  let wardMatch;
  let streetMatch;
  let dastatusMatch;
  let pincodeMatch;
  if (dastatus != 'null') {
    dastatusMatch = [{ daStatus: { $eq: dastatus } }];
  } else {
    dastatusMatch = [{ active: { $eq: true } }];
  }
  if (pincode != 'null') {
    pincodeMatch = [{ Pincode: { $eq: parseInt(pincode) } }];
  } else {
    pincodeMatch = [{ active: { $eq: true } }];
  }
  // //console.log(pincodeMatch)
  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }
  // //console.log(zoneMatch)
  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }
  //  //console.log(wardMatch)
  if (street != 'null') {
    streetMatch = [{ _id: { $eq: street } }];
  } else {
    streetMatch = [{ active: { $eq: true } }];
  }
  // //console.log(streetMatch)

  if (uid != 'null' && date == 'null') {
    match = [{ Uid: { $eq: uid } }];
  } else if (date != 'null' && uid == 'null') {
    match = [{ date: { $eq: date } }];
  } else if (uid != 'null' && date != 'null') {
    match = [{ Uid: { $eq: uid } }, { date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }

  // let match;
  // if (uid != 'null' && date == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }];
  // } else if (uid != 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }];
  // } else if (uid == 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }];
  // } else {
  //   match = [{ Wardid: { $eq: id } }];
  // }
  // //console.log(match)
  let data = await Shop.aggregate([
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
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
        // $and: [
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: 'Reassign' } },
        //   ],
        // },
        // {
        //   $and: [
        //     { telecallerStatus: { $ne: 'Assign' } },
        //     { telecallerStatus: { $ne: 'tempReassign' } },
        //     { telecallerStatus: { $eq: null } },
        //   ],
        // },
        // ],
        telecallerStatus: { $nin: ['Assign', 'tempReassign', 'Reassign'] },
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
        Pincode: 1,
        salesmanOrderStatus: 1,
      },
    },
    { $match: { salesmanOrderStatus: { $nin: ['Assign'] } } },
  ]);
  return data;
};

const getUsersWith_skiped = async (id) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $ne: id } }, { userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }],
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ telecallerteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        foreignField: 'fromtelecallerteamId',
        as: 'telecallershopsData',
      },
    },
    {
      $project: {
        data: { $size: '$telecallershopsData' },
        name: 1,
      },
    },
    {
      $match: {
        $and: [{ data: { $eq: 0 } }],
      },
    },
  ]);

  return values;
};

const history_Assign_Reaasign_datatelecaller = async (id) => {
  const name = await Users.findById(id);
  // let match;
  // if (date != 'null' && idSearch == 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { date: { $eq: date } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { reAssignDate: { $eq: date } }] },
  //     ],
  //   };
  // } else if (tempid != 'null' && date == 'null' && idSearch == 'null') {
  //   match = {
  //     $or: [
  //       // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: tempid } }] },
  //     ],
  //   };
  // } else if (tempid != 'null' && date != 'null' && idSearch == 'null') {
  //   match = {
  //     $or: [
  //       // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
  //       {
  //         $and: [
  //           { salesManId: { $eq: id } },
  //           { status: { $eq: 'tempReassign' } },
  //           { reAssignDate: { $eq: date } },
  //           { fromSalesManId: { $eq: tempid } },
  //         ],
  //       },
  //     ],
  //   };
  // } else if (date != 'null' && idSearch != 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       {
  //         $and: [
  //           { fromSalesManId: { $eq: id } },
  //           { status: { $eq: 'Assign' } },
  //           { date: { $eq: date } },
  //           { salesManId: { $eq: idSearch } },
  //         ],
  //       },
  //       {
  //         $and: [
  //           { salesManId: { $eq: id } },
  //           { status: { $eq: 'tempReassign' } },
  //           { reAssignDate: { $eq: date } },
  //           { fromSalesManId: { $eq: idSearch } },
  //         ],
  //       },
  //     ],
  //   };
  // } else if (date == 'null' && idSearch != 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { salesManId: { $eq: idSearch } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: idSearch } }] },
  //     ],
  //   };
  // } else {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
  //     ],
  //   },
  // }
  // //console.log(match)
  const data = await TelecallerShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromtelecallerteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ telecallerteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromtelecallerteamId',
        foreignField: '_id',
        as: 'Users',
      },
    },
    {
      $unwind: '$Users',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesdata',
      },
    },
    {
      $unwind: '$b2bshopclonesdata',
    },
    {
      $project: {
        salesMan: '$Users.name',
        telecallerteamId: 1,
        shopId: 1,
        status: 1,
        date: 1,
        fromtelecallerteamId: 1,
        time: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        shopname: '$b2bshopclonesdata.SName',
      },
    },
  ]);
  return { data, name: name.name };
};

const Return_Assign_To_telecaller = async (id) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currentTime = moment().format('hh:mm a');
  await TelecallerShop.updateMany(
    { fromtelecallerteamId: id, status: 'tempReassign' },
    { $set: { status: 'Assign', telecallerteamId: id, date: currentDate, time: currentTime } },
    { new: true }
  );
  return { Message: 'Successfully Re-Assigned to telecaller' };
};

const createtemperaryAssigndata = async (body) => {
  let serverdate = moment().format('YYYY-MM-DD');
  let time = moment().format('hh:mm a');
  body.arr.forEach(async (e) => {
    let data = await TelecallerShop.find({ shopId: e, status: { $in: ['Assign', 'tempReassign'] } });
    // //console.log(data);
    if (data.length != 0) {
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { telecallerStatus: body.status }, { new: true });
        // //console.log(f._id);
        await TelecallerShop.findByIdAndUpdate(
          { _id: f._id },
          {
            telecallerteamId: body.telecallerteamId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    }
    // else {
    //   body.arr.forEach(async (e) => {
    //     await SalesManShop.create({
    //       shopId: e,
    //       status: body.status,
    //       salesManId: body.salesManId,
    //       date: serverdate,
    //       time: time,
    //     });
    //   });
    // }
  });

  return { data: 'created' };
};

const getAssignData_by_Telecaller = async (page) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }],
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'telecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'salesMan',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'telecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesMandata',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'fromtelecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        fromtelecallerteamId: '$saleMan.fromtelecallerteamId',
        no_of_shop: { $size: '$salesMan' },
        no_of_temperory: { $size: '$salesMandata' },
        temp: { $size: '$salesmanshopsdata' },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }],
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'telecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'salesMan',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'telecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesMandata',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'fromtelecallerteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        fromtelecallerteamId: '$saleMan.fromtelecallerteamId',
        no_of_shop: { $size: '$salesMan' },
        no_of_temperory: { $size: '$salesMandata' },
        temp: { $size: '$salesmanshopsdata' },
      },
    },
  ]);

  return { values: values, total: total.length };
};

// shop allocation reports
const assignShopsTelecaller = async (id, page) => {
  const data = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
          {
            $lookup: {
              from: 'telecallershops',
              localField: '_id',
              foreignField: 'shopId',
              pipeline: [
                {
                  $match: {
                    $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
                  },
                },
              ],
              as: 'salesmanshopsdata',
            },
          },
          {
            $unwind: {
              path: '$salesmanshopsdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              assign: { $ifNull: ['$salesmanshopsdata', false] },
            },
          },
          {
            $match: {
              assign: false,
            },
          },
          {
            $project: {
              Slat: 1,
              Slong: 1,
            },
          },
        ],
        as: 'latsalesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: 'b2bshopclonesdata._id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },

    // {
    //   $lookup: {
    //     from: 'b2bshopclones',
    //     localField: 'salesmanshopsdata.shopId',
    //     foreignField: '_id',
    //     as: 'b2bshopclonesdatalat',
    //   },
    // },
    // {
    //   $unwind:'$b2bshopclonesdatalat'
    // },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        // latLong:"$b2bshopclonesdatalat",
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
        latun: { $size: '$latsalesmanshopsdata' },
        lat: '$latsalesmanshopsdata',
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
          {
            $lookup: {
              from: 'telecallershops',
              localField: '_id',
              foreignField: 'shopId',
              pipeline: [
                {
                  $match: {
                    $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
                  },
                },
              ],
              as: 'salesmanshopsdata',
            },
          },
          {
            $unwind: {
              path: '$salesmanshopsdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              assign: { $ifNull: ['$salesmanshopsdata', false] },
            },
          },
          {
            $match: {
              assign: false,
            },
          },
          {
            $project: {
              Slat: 1,
              Slong: 1,
            },
          },
        ],
        as: 'latsalesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: 'b2bshopclonesdata._id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },

    // {
    //   $lookup: {
    //     from: 'b2bshopclones',
    //     localField: 'salesmanshopsdata.shopId',
    //     foreignField: '_id',
    //     as: 'b2bshopclonesdatalat',
    //   },
    // },
    // {
    //   $unwind:'$b2bshopclonesdatalat'
    // },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        // latLong:"$b2bshopclonesdatalat",
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
        latun: { $size: '$latsalesmanshopsdata' },
        lat: '$latsalesmanshopsdata',
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
  ]);
  return { data: data, count: total.length };
};

const assignShopsTelecallerdatewise = async (id, wardid, page) => {
  const data = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'telecallershops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  return { data: data, count: total.length };
};

const assignShopsOnlydatewise = async (id, wardid, page) => {
  const data = await TelecallerShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
            },
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromtelecallerteamId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromtelecallerteamId: '$fromtelecallerteamId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await TelecallerShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
            },
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromtelecallerteamId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromtelecallerteamId: '$fromtelecallerteamId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
  ]);

  return { data: data, count: total.length };
};

// salesmanOrder

const createsalesmanAssignReassign = async (body) => {
  let { arr } = body;
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Users.findByIdAndUpdate({ _id: e }, { salesmanOrderStatus: body.status }, { new: true });
      await SalesmanOrder.create({
        salesmanOrderheadId: body.salesmanOrderheadId,
        salesmanOrderteamId: e,
        status: body.status,
        date: serverdate,
        time: time,
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await SalesmanOrder.find({
        salesmanOrderheadId: body.salesmanOrderheadId,
        salesmanOrderteamId: e,
        status: 'Assign',
      });
      data.forEach(async (f) => {
        await Users.findByIdAndUpdate({ _id: f.salesmanOrderteamId }, { salesmanOrderStatus: body.status }, { new: true });
        await SalesmanOrder.findByIdAndUpdate(
          { _id: f._id },
          {
            salesmanOrderheadId: f.salesmanOrderheadId,
            salesmanOrderheadId: f.salesmanOrderheadId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  }
  return 'created';
};

const getAllAsmSalesmanHead = async () => {
  let data = await Users.find({ userRole: '719d9f71-8388-4534-9bfe-3f47faed62ac', active: true }).select(
    'name email userRole'
  );
  if (data.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  return data;
};

const getUnassignedsalesmanOrder = async (page) => {
  let data = await Users.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
              { active: { $eq: true } },
            ],
          },
          {
            $and: [
              { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } },
              { salesmanOrderStatus: { $eq: null } },
              { active: { $eq: true } },
            ],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
              { active: { $eq: true } },
            ],
          },
          {
            $and: [
              { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } },
              { salesmanOrderStatus: { $eq: null } },
              { active: { $eq: true } },
            ],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);
  let overall = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }, { active: { $eq: true } }],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);

  let Assingned = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }, { salesmanOrderStatus: { $eq: 'Assign' } }],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);

  return { data: data, total: total.length, overAll: overall.length, Assingned: Assingned.length };
};

const getsalemanOrderSalesman = async (id) => {
  const name = await Users.findById(id);
  let data = await SalesmanOrder.aggregate([
    {
      $match: {
        $and: [{ salesmanOrderheadId: { $eq: id } }, { status: { $eq: 'Assign' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        let: {
          localField: '$salesmanOrderteamId',
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$salesmanOrderteamId', '$$localField'] } } },
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project: {
        salesmanname: '$b2busersData.name',
        salesmanOrderheadId: 1,
        status: 1,
        salesmanOrderteamId: 1,
        date: 1,
        time: 1,
        _id: 1,
        Count: { $size: '$b2bshopclonesdata' },
      },
    },
  ]);
  return { data: data, name: name.name };
};

const createsalesmanOrderShop = async (body) => {
  let { arr } = body;
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let creat = moment().format('yyy-MM-DD');
  let creat1 = moment().format('HHmmss');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e }, { salesmanOrderStatus: body.status }, { new: true });
      await SalesmanOrderShop.create({
        salesmanOrderteamId: body.salesmanOrderteamId,
        shopId: e,
        status: body.status,
        fromsalesmanOrderteamId: body.fromsalesmanOrderteamId,
        time: time,
        date: serverdate,
        created: creat,
        createdTime: creat1,
      });
    });
  } else if (body.status == 'tempReassign') {
    arr.forEach(async (e) => {
      let data = await SalesmanOrderShop.find({
        salesmanOrderteamId: body.salesmanOrderteamId,
        shopId: e,
        status: { $in: ['Assign', 'tempReassign'] },
      });
      //console.log(data);
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { salesmanOrderStatus: body.status }, { new: true });
        await SalesmanOrderShop.findByIdAndUpdate(
          { _id: f._id },
          {
            salesmanOrderteamId: f.salesmanOrderteamId,
            fromsalesmanOrderteamId: f.fromsalesmanOrderteamId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await SalesmanOrderShop.find({
        salesmanOrderteamId: body.salesmanOrderteamId,
        shopId: e,
        status: { $in: ['Assign', 'tempReassign'] },
      });
      //console.log(data);
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { salesmanOrderStatus: body.status }, { new: true });
        await SalesmanOrderShop.findByIdAndUpdate(
          { _id: f._id },
          {
            salesmanOrderteamId: f.salesmanOrderteamId,
            fromsalesmanOrderteamId: f.fromsalesmanOrderteamId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  }
  return 'created';
};

const getAllSalesman = async () => {
  const data = await Users.find({ userRole: 'fb0dd028-c608-4caa-a7a9-b700389a098d', active: true }).select(
    'name email phoneNumber userRole'
  );
  return data;
};

const getsalesmanOrderAssignedShops = async (id) => {
  const name = await Users.findById(id);
  let data = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        salesmanname: '$b2busersData.name',
        salesmanOrderteamId: 1,
        fromsalesmanOrderteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        lat: '$b2bshopclonesData.da_lot',
        long: '$b2bshopclonesData.da_long',
        verifyStatus: '$b2bshopclonesData.new_re_approve',
        _id: 1,
      },
    },
  ]);
  let total = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        salesmanname: '$b2busersData.name',
        salesmanOrderteamId: 1,
        fromsalesmanOrderteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  let lastdata = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $group: {
        _id: { createdTime: '$createdTime', created: '$created' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        date: '$_id.created',
        createdTime: '$_id.createdTime',
        count: 1,
      },
    },
    {
      $sort: { date: -1, createdTime: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  return { data: data, salesmanName: name.name, count: total.length, lastdata };
};

const my_assigned_shops = async (id, query) => {
  //console.log(id);
  let page = query.page == '' || query.page == null || query.page == null ? 0 : parseInt(query.page);

  let serach = { active: true };

  if (query.search != null && query.search != 'null' && query.search != '') {
    serach = {
      $or: [{ SName: { $regex: query.search, $options: 'i' } }, { mobile: { $regex: query.search, $options: 'i' } }],
    };
  }
  const name = await Users.findById(id);
  let data = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [serach] } },
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'streets',
            },
          },
          {
            $unwind: '$streets',
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
            $unwind: '$shoptype',
          },
        ],
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        SName: '$b2bshopclonesData.SName',
        salesmanname: '$b2busersData.name',
        street: '$b2bshopclonesData.streets.street',
        SOwner: '$b2bshopclonesData.SOwner',
        address: '$b2bshopclonesData.address',
        shoptype: '$b2bshopclonesData.shoptype.shopList',
        salesmanOrderteamId: 1,
        fromsalesmanOrderteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        created: '$b2bshopclonesData.created',
        date: '$b2bshopclonesData.date',
        _id: '$b2bshopclonesData._id',
        Slat: '$b2bshopclonesData.Slat',
        Slong: '$b2bshopclonesData.Slong',
        photoCapture: '$b2bshopclonesData.photoCapture',
        mobile: '$b2bshopclonesData.mobile',
        new_re_approve: '$b2bshopclonesData.new_re_approve',
      },
    },
    { $sort: { new_re_approve: 1 } },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  let total = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        salesmanname: '$b2busersData.name',
        salesmanOrderteamId: 1,
        fromsalesmanOrderteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
    {
      $skip: 10 * (parseInt(page) + 1),
    },
    {
      $limit: 10,
    },
  ]);
  return { data: data, salesmanName: name.name, next: total.length != 0 };
};

const getnotAssignsalesmanOrderShops = async (zone, id, street, page, limit, uid, date, dastatus, pincode, Da) => {
  let capture;
  let match;
  let daUser;
  let zoneMatch;
  let wardMatch;
  let streetMatch;
  let dastatusMatch;
  let pincodeMatch;
  let daUser1;
  if (dastatus != 'null') {
    dastatusMatch = [{ daStatus: { $eq: dastatus } }];
  } else {
    dastatusMatch = [{ daStatus: { $nin: ['Cannot Spot the Shop', 'Not Interested'] } }];
  }
  if (pincode != 'null') {
    pincodeMatch = [{ Pincode: { $eq: parseInt(pincode) } }];
  } else {
    pincodeMatch = [{ active: { $eq: true } }];
  }

  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }
  // //console.log(zoneMatch)
  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }
  //  //console.log(wardMatch)
  if (street != 'null') {
    streetMatch = [{ _id: { $eq: street } }];
  } else {
    streetMatch = [{ active: { $eq: true } }];
  }
  // //console.log(streetMatch)
  if (uid != 'null') {
    capture = { Uid: { $eq: uid } };
  } else {
    capture = { active: { $eq: true } };
  }
  if (uid != 'null' && date == 'null') {
    match = [{ Uid: { $eq: uid } }];
  } else if (date != 'null' && uid == 'null') {
    match = [{ date: { $eq: date } }];
  } else if (uid != 'null' && date != 'null') {
    match = [{ Uid: { $eq: uid } }, { date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }
  if (Da != 'null') {
    daUser = [{ DA_USER: { $eq: Da } }];
    // daUser ={$or:[{ $and: [{ fromSalesManId: { $eq: Da } }, { status: { $eq: 'Assign' } }] },{ $and: [{ salesManId: { $eq: Da } }, { status: { $eq: 'tempReassign' } }]}]}
  } else {
    // daUser = {$and:[{ active: { $eq: true } }]};
    daUser = [{ active: { $eq: true } }];
  }

  if (Da != 'null') {
    // daUser1 = [{ DA_USER: { $eq: Da } }];
    daUser1 = {
      $or: [
        { $and: [{ fromSalesManId: { $eq: Da } }, { status: { $eq: 'Assign' } }] },
        { $and: [{ salesManId: { $eq: Da } }, { status: { $eq: 'tempReassign' } }] },
      ],
    };
  } else {
    daUser1 = {
      $and: [{ active: { $eq: true } }, { $or: [{ status: { $eq: 'Assign' } }, { status: { $eq: 'tempReassign' } }] }],
    };
    //  daUser1 = [{ active: { $eq: true } }];
  }
  // let match;
  // if (uid != 'null' && date == 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }];
  // } else if (uid != 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { Uid: { $eq: uid } }, { date: { $eq: date } }];
  // } else if (uid == 'null' && date != 'null') {
  //   match = [{ Wardid: { $eq: id } }, { date: { $eq: date } }];
  // } else {
  //   match = [{ Wardid: { $eq: id } }];
  // }
  //console.log(daUser1);
  let data = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
      },
    },
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: daUser,
      },
    },
    // {
    //   $lookup: {
    //     from: 'salesmanshops',
    //     localField: '_id',
    //     foreignField: 'shopId',
    //     pipeline:[
    //       {
    //         $match:daUser
    //       },
    //     ],
    //     as: 'salesmanshops',
    //   },
    // },
    // {
    //   $unwind: '$salesmanshops',
    // },
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
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: null } },
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
        Pincode: 1,
        DA_USER: 1,
      },
    },
    {
      $skip: parseInt(limit) * parseInt(page),
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  let allnoAssing = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
      },
    },
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    // {
    //   $lookup: {
    //     from: 'salesmanshops',
    //     localField: '_id',
    //     foreignField: 'shopId',
    //     pipeline:[
    //       {
    //         $match:daUser
    //       },
    //     ],
    //     as: 'salesmanshops',
    //   },
    // },
    // {
    //   $unwind: '$salesmanshops',
    // },
    {
      $match: {
        $and: daUser,
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
  ]);
  let total = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
      },
    },
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: daUser,
      },
    },
    // {
    //   $lookup: {
    //     from: 'salesmanshops',
    //     localField: '_id',
    //     foreignField: 'shopId',
    //     pipeline:[
    //       {
    //         $match:daUser
    //       },
    //     ],
    //     as: 'salesmanshops',
    //   },
    // },
    // {
    //   $unwind: '$salesmanshops',
    // },
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
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: null } },
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
  ]);
  let total1 = await Shop.aggregate([
    {
      $match: {
        $and: [capture, { $or: [{ salesManStatus: { $eq: 'Assign' } }, { salesManStatus: { $eq: 'tempReassign' } }] }],
      },
    },
    // {
    //   $match: {
    //     $or: [
    //       {
    //         $and: [{ salesManStatus: { $eq: 'Assign' } }],
    //       },
    //       {
    //         $and: [{ salesManStatus: { $eq: 'tempReassign' } }],
    //       },
    //     ],
    //   },
    // },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: daUser1,
          },
        ],
        as: 'salesmanshops',
      },
    },
    {
      $unwind: '$salesmanshops',
    },
    // {
    //   $lookup: {
    //     from: 'wards',
    //     localField: 'Wardid',
    //     foreignField: '_id',
    //     pipeline:[
    //       {
    //         $match: {
    //           $and: wardMatch,
    //         },
    //       },
    //     ],
    //     as: 'wards',
    //   },
    // },
    // {
    //   $unwind: '$wards',
    // },
    // {
    //   $lookup: {
    //     from: 'zones',
    //     localField: 'wards.zoneId',
    //     foreignField: '_id',
    //     pipeline:[
    //       {
    //         $match: {
    //           $and: zoneMatch,
    //         },
    //       },
    //     ],
    //     as: 'zones',
    //   },
    // },
    // {
    //   $unwind: '$zones',
    // },
    // {
    //   $project: {
    //     SOwner: 1,
    //     SName: 1,
    //     mobile: 1,
    //     address: 1,
    //     Slat: 1,
    //     Slong: 1,
    //     Uid:1,
    //     date:1,
    //     ward:'$wards.ward',
    //     Wardid:1,
    //     zoneId:'$wards.zoneId',
    //     zone:'$zones.zone',
    //     streetId: '$streets._id',
    //     streetname: '$streets.street',
    //     locality: '$streets.locality',
    //     _id: 1,
    //     displaycount: 1,
    //   },
    // },
  ]);
  let lat = await Shop.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $and: dastatusMatch,
      },
    },
    {
      $match: {
        $and: pincodeMatch,
      },
    },
    {
      $match: {
        $and: daUser,
      },
    },
    // {
    //   $lookup: {
    //     from: 'salesmanshops',
    //     localField: '_id',
    //     foreignField: 'shopId',
    //     pipeline:[
    //       {
    //         $match:daUser
    //       },
    //     ],
    //     as: 'salesmanshops',
    //   },
    // },
    // {
    //   $unwind: '$salesmanshops',
    // },
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
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: null } },
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
        address: 1,
        Slat: 1,
        Slong: 1,
        // Uid:1,
        // date:1,
        // ward:'$wards.ward',
        // Wardid:1,
        // zoneId:'$wards.zoneId',
        // zone:'$zones.zone',
        // streetId: '$streets._id',
        // streetname: '$streets.street',
        // locality: '$streets.locality',
        // _id: 1,
        // displaycount: 1,
        // Pincode:1,
        // DA_USER:1,
        salesmanOrderStatus: 1,
      },
    },
  ]);
  let cap;
  // if(uid != 'null'){
  cap = total1.length;
  // }else{
  //  cap = 0 ;
  // }
  return {
    data: data,
    total: total.length,
    overall: allnoAssing.length,
    assignCount: cap,
    // assignCountss: cap.length,
    lat: lat,
  };
};

const getUserssalesmanWith_skiped = async (id) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $ne: id } }, { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        foreignField: 'fromsalesmanOrderteamId',
        as: 'telecallershopsData',
      },
    },
    {
      $project: {
        data: { $size: '$telecallershopsData' },
        name: 1,
      },
    },
    {
      $match: {
        $and: [{ data: { $eq: 0 } }],
      },
    },
  ]);

  return values;
};

const Return_Assign_To_salesmanOrder = async (id) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currentTime = moment().format('hh:mm a');
  await SalesmanOrderShop.updateMany(
    { fromsalesmanOrderteamId: id, status: 'tempReassign' },
    { $set: { status: 'Assign', salesmanOrderteamId: id, date: currentDate, time: currentTime } },
    { new: true }
  );
  return { Message: 'Successfully Re-Assigned to telecaller' };
};

const createsalesmantemperaryAssigndata = async (body) => {
  let serverdate = moment().format('YYYY-MM-DD');
  let time = moment().format('hh:mm a');
  body.arr.forEach(async (e) => {
    let data = await SalesmanOrderShop.find({ _id: e, status: { $in: ['Assign', 'tempReassign'] } });
    // //console.log(data);
    if (data.length != 0) {
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { salesmanOrderStatus: body.status }, { new: true });
        // //console.log(f._id);
        await SalesmanOrderShop.findByIdAndUpdate(
          { _id: f._id },
          {
            salesmanOrderteamId: body.salesmanOrderteamId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    }
    // else {
    //   body.arr.forEach(async (e) => {
    //     await SalesManShop.create({
    //       shopId: e,
    //       status: body.status,
    //       salesManId: body.salesManId,
    //       date: serverdate,
    //       time: time,
    //     });
    //   });
    // }
  });
};

const getAssignData_by_SalesmanOrders = async (page) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'salesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'salesMan',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'salesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesMandata',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'fromsalesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'customer_final_USER',
        as: 'shops',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        fromsalesmanOrderteamId: '$saleMan.fromsalesmanOrderteamId',
        no_of_shop: { $size: '$salesMan' },
        no_of_temperory: { $size: '$salesMandata' },
        temp: { $size: '$salesmanshopsdata' },
        verifiedCount: { $size: '$shops' },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'salesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'salesMan',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'salesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesMandata',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'fromsalesmanOrderteamId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        fromsalesmanOrderteamId: '$saleMan.fromsalesmanOrderteamId',
        no_of_shop: { $size: '$salesMan' },
        no_of_temperory: { $size: '$salesMandata' },
        temp: { $size: '$salesmanshopsdata' },
      },
    },
  ]);

  return { values: values, total: total.length };
};

const assignShopsSalesmanOrder = async (id, page) => {
  const data = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
          {
            $lookup: {
              from: 'salesmanordershops',
              localField: '_id',
              foreignField: 'shopId',
              pipeline: [
                {
                  $match: {
                    $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
                  },
                },
              ],
              as: 'salesmanshopsdata',
            },
          },
          {
            $unwind: {
              path: '$salesmanshopsdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              assign: { $ifNull: ['$salesmanshopsdata', false] },
            },
          },
          {
            $match: {
              assign: false,
            },
          },
          {
            $project: {
              Slat: 1,
              Slong: 1,
            },
          },
        ],
        as: 'latsalesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: 'b2bshopclonesdata._id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },

    // {
    //   $lookup: {
    //     from: 'b2bshopclones',
    //     localField: 'salesmanshopsdata.shopId',
    //     foreignField: '_id',
    //     as: 'b2bshopclonesdatalat',
    //   },
    // },
    // {
    //   $unwind:'$b2bshopclonesdatalat'
    // },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        // latLong:"$b2bshopclonesdatalat",
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
        latun: { $size: '$latsalesmanshopsdata' },
        lat: '$latsalesmanshopsdata',
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
          {
            $lookup: {
              from: 'salesmanordershops',
              localField: '_id',
              foreignField: 'shopId',
              pipeline: [
                {
                  $match: {
                    $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
                  },
                },
              ],
              as: 'salesmanshopsdata',
            },
          },
          {
            $unwind: {
              path: '$salesmanshopsdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              assign: { $ifNull: ['$salesmanshopsdata', false] },
            },
          },
          {
            $match: {
              assign: false,
            },
          },
          {
            $project: {
              Slat: 1,
              Slong: 1,
            },
          },
        ],
        as: 'latsalesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: 'b2bshopclonesdata._id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },

    // {
    //   $lookup: {
    //     from: 'b2bshopclones',
    //     localField: 'salesmanshopsdata.shopId',
    //     foreignField: '_id',
    //     as: 'b2bshopclonesdatalat',
    //   },
    // },
    // {
    //   $unwind:'$b2bshopclonesdatalat'
    // },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        // latLong:"$b2bshopclonesdatalat",
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
        latun: { $size: '$latsalesmanshopsdata' },
        lat: '$latsalesmanshopsdata',
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
  ]);
  return { data: data, count: total.length };
};

const assignShopssalesmandatewise = async (id, wardid, page) => {
  const data = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanordershops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  return { data: data, count: total.length };
};

const assignShopssalesmanOnlydatewise = async (id, wardid, page) => {
  const data = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
            },
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromsalesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromsalesmanOrderteamId: '$fromsalesmanOrderteamId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
            },
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromsalesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromsalesmanOrderteamId: '$fromsalesmanOrderteamId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
  ]);

  return { data: data, count: total.length };
};

const history_Assign_Reaasign_datasalesman = async (id) => {
  const name = await Users.findById(id);
  // let match;
  // if (date != 'null' && idSearch == 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { date: { $eq: date } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { reAssignDate: { $eq: date } }] },
  //     ],
  //   };
  // } else if (tempid != 'null' && date == 'null' && idSearch == 'null') {
  //   match = {
  //     $or: [
  //       // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: tempid } }] },
  //     ],
  //   };
  // } else if (tempid != 'null' && date != 'null' && idSearch == 'null') {
  //   match = {
  //     $or: [
  //       // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
  //       {
  //         $and: [
  //           { salesManId: { $eq: id } },
  //           { status: { $eq: 'tempReassign' } },
  //           { reAssignDate: { $eq: date } },
  //           { fromSalesManId: { $eq: tempid } },
  //         ],
  //       },
  //     ],
  //   };
  // } else if (date != 'null' && idSearch != 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       {
  //         $and: [
  //           { fromSalesManId: { $eq: id } },
  //           { status: { $eq: 'Assign' } },
  //           { date: { $eq: date } },
  //           { salesManId: { $eq: idSearch } },
  //         ],
  //       },
  //       {
  //         $and: [
  //           { salesManId: { $eq: id } },
  //           { status: { $eq: 'tempReassign' } },
  //           { reAssignDate: { $eq: date } },
  //           { fromSalesManId: { $eq: idSearch } },
  //         ],
  //       },
  //     ],
  //   };
  // } else if (date == 'null' && idSearch != 'null' && tempid == 'null') {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { salesManId: { $eq: idSearch } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: idSearch } }] },
  //     ],
  //   };
  // } else {
  //   match = {
  //     $or: [
  //       { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
  //       { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
  //     ],
  //   },
  // }
  // //console.log(match)
  const data = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromsalesmanOrderteamId',
        foreignField: '_id',
        as: 'Users',
      },
    },
    {
      $unwind: '$Users',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesdata',
      },
    },
    {
      $unwind: '$b2bshopclonesdata',
    },
    {
      $project: {
        salesMan: '$Users.name',
        salesmanOrderteamId: 1,
        shopId: 1,
        status: 1,
        date: 1,
        fromsalesmanOrderteamId: 1,
        time: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        shopname: '$b2bshopclonesdata.SName',
      },
    },
  ]);
  return { data, name: name.name };
};

const pincode = async (query) => {
  const { status } = query;
  let statusMatch = { daStatus: { $nin: ['Not Interested', 'Cannot Spot the Shop'] } };
  if (status != 'null') {
    statusMatch = { daStatus: status };
  } else {
    statusMatch;
  }
  return await Shop.aggregate([
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }, { Pincode: { $ne: null } }, statusMatch],
      },
    },
    // {
    //   $group: {
    //     _id: { Pincode: '$Pincode' },
    //   },
    // },
    {
      $group: {
        _id: '$Pincode',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        Pincode: '$_id',
        count: '$count',
      },
    },
  ]);
};

const getnotAssignsalesmanOrderShops_lat = async (zone, id) => {
  let zoneMatch;
  let wardMatch;

  if (zone != 'null') {
    zoneMatch = [{ _id: { $eq: zone } }];
  } else {
    zoneMatch = [{ active: { $eq: true } }];
  }

  if (id != 'null') {
    wardMatch = [{ _id: { $eq: id } }];
  } else {
    wardMatch = [{ active: { $eq: true } }];
  }

  let data = await Shop.aggregate([
    {
      $match: {
        $and: [{ status: { $eq: 'data_approved' } }],
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: 'Reassign' } },
            ],
          },
          {
            $and: [
              { salesmanOrderStatus: { $ne: 'Assign' } },
              { salesmanOrderStatus: { $ne: 'tempReassign' } },
              { salesmanOrderStatus: { $eq: null } },
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
        Pincode: 1,
      },
    },
  ]);
  return { data: data };
};

const AssignedData_By_users = async (userId) => {
  let values = await SalesmanOrderShop.aggregate([
    {
      $match: {
        salesmanOrderteamId: userId,
        status: { $ne: 'Reassign' },
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { salesmanOrderStatus: { $in: ['Assign', 'tempReassign'] }, new_re_approve: { $eq: null } } }],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
  ]);

  let approved = await SalesmanOrderShop.aggregate([
    {
      $match: {
        salesmanOrderteamId: userId,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { new_re_approve: { $ne: null } } }],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
  ]);

  return { AssignOnly: values, approvedOnly: approved };
};

const getLat_long = async (body) => {
  const { arr } = body;
  let findByIdDatas = await Shop.aggregate([
    {
      $match: { $and: [{ _id: { $in: arr } }] },
    },
  ]);
  return findByIdDatas;
};

const tempAssign = async (body) => {
  const { arr, fromsalesman, tosalesman, status } = body;
  let today = moment().format('DD-MM-YYYY');
  let time = moment().format('hh:mm a');
  arr.forEach(async (e) => {
    await Shop.findByIdAndUpdate({ _id: e }, { salesmanOrderStatus: status }, { new: true });

    await SalesmanOrderShop.findOneAndUpdate(
      {
        salesmanOrderteamId: fromsalesman,
        shopId: e,
        status: { $in: ['Assign', 'tempReassign'] },
      },

      { reAssignDate: today, reAssignTime: time, status: body.status, salesmanOrderteamId: tosalesman },
      { new: true }
    );
  });
  return 'works';
};

const getNewEdite = async (page, limit, mobile, status, pincode, verify) => {
  // let userMatch = { Uid: id };
  page = parseInt(page);
  limit = parseInt(limit);
  let statusMatch = { active: true };
  let mobileMatch = { active: true };
  let PincodeMatch = { active: true };
  let verifyMatch = { active: true };
  if (mobile != 'null') {
    mobileMatch = { mobile: { $eq: mobile } };
  }

  if (status != 'null') {
    statusMatch = { daStatus: { $eq: status } };
  }

  if (pincode != 'null') {
    PincodeMatch = { Pincode: { $eq: parseInt(pincode) } };
  }
  if (verify != 'null') {
    if (verify == 'verified') {
      statusMatch = {
        new_re_approve: {
          $in: [
            'Shop Closed/ Shifted',
            'Recognised & Fence Sitter',
            'Recognised & Interested',
            'Cannot Spot the shop',
            'Not interested',
            'Irrelevant Shop',
          ],
        },
      };
    }
    if (verify == 'pending') {
      statusMatch = {
        new_re_approve: {
          $nin: [
            'Shop Closed/ Shifted',
            'Recognised & Fence Sitter',
            'Recognised & Interested',
            'Cannot Spot the shop',
            'Not interested',
            'Irrelevant Shop',
          ],
        },
      };
    }
  }

  let dastatusMatch = { active: true };
  const data = await Shop.aggregate([
    { $match: { $and: [statusMatch, mobileMatch, statusMatch, PincodeMatch, statusMatch] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'firstUsers',
      },
    },
    {
      $unwind: {
        path: '$firstUsers',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'DA_USER',
        foreignField: '_id',
        as: 'secondUsers',
      },
    },
    {
      $unwind: {
        path: '$secondUsers',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'customer_final_USER',
        foreignField: '_id',
        as: 'thirdUsers',
      },
    },
    {
      $unwind: {
        path: '$thirdUsers',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        as: 'wards',
      },
    },
    {
      $unwind: {
        path: '$wards',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shopType',
      },
    },
    {
      $unwind: {
        path: '$shopType',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streets',
      },
    },
    {
      $unwind: {
        path: '$streets',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $skip: limit * page },
    { $limit: limit },
  ]);

  const total = await Shop.aggregate([
    { $match: { $and: [statusMatch, mobileMatch, statusMatch, PincodeMatch, statusMatch] } },
  ]);
  return { data: data, total: total.length };
};

const newliEdit = async (id, body) => {
  let data = await Shop.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Shop Not Available');
  }
  let edite = { ...body, ...{ editStatus: 'Edited' } };
  data = await Shop.findByIdAndUpdate({ _id: id }, edite, { new: true });
  return edite;
};

module.exports = {
  createtelecallerAssignReassign,
  getAllTelecallerHead,
  getUnassignedtelecaller,
  gettelecallerheadTelecaller,
  createTelecallerShop,
  getAllTelecaller,
  getTelecallerAssignedShops,
  getnotAssignShops,
  getUsersWith_skiped,
  Return_Assign_To_telecaller,
  createtemperaryAssigndata,
  getAssignData_by_Telecaller,
  assignShopsTelecaller,
  assignShopsTelecallerdatewise,
  assignShopsOnlydatewise,
  createsalesmanAssignReassign,
  getAllAsmSalesmanHead,
  getUnassignedsalesmanOrder,
  getsalemanOrderSalesman,
  createsalesmanOrderShop,
  getAllSalesman,
  getsalesmanOrderAssignedShops,
  getnotAssignsalesmanOrderShops,
  getUserssalesmanWith_skiped,
  Return_Assign_To_salesmanOrder,
  createsalesmantemperaryAssigndata,
  getAssignData_by_SalesmanOrders,
  assignShopsSalesmanOrder,
  assignShopssalesmandatewise,
  assignShopssalesmanOnlydatewise,
  history_Assign_Reaasign_datatelecaller,
  history_Assign_Reaasign_datasalesman,
  pincode,
  getnotAssignsalesmanOrderShops_lat,
  my_assigned_shops,
  getnotAssignShops_without_Page,
  AssignedData_By_users,
  getLat_long,
  tempAssign,
  getNewEdite,
  newliEdit,
};
