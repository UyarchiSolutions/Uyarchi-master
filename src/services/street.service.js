const httpStatus = require('http-status');
const { Street } = require('../models');
const ApiError = require('../utils/ApiError');
const Ward = require('../models/ward.model');
const ManageUser = require('../models/manageUser.model');
const Streets = require('../models/street.model');
const { Apartment, Shop } = require('../models/apartmentTable.model');

const createStreet = async (streetBody) => {
  const { wardId } = streetBody;
  let war = await Ward.findById(wardId);
  let values = {};
  values = { ...streetBody, ...{ ward: war.ward } };
  if (war === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops');
  }
  return Street.create(values);
};

const getStreetById = async (id) => {
  const street = Street.findById(id);
  return street;
};

const updates = async () => {
  // const street = await Street.find({closed:"close"})
  // let count=0;
  // street.forEach(async (e) => {
  //   let wardId = e.wardId;
  //   let oo = await Ward.findById(wardId);
  //   // //console.log(oo.zoneId, e.zone);
  //     await Street.findByIdAndUpdate({ _id: e._id }, {closed:""}, { new: true });
  //     count+=1;
  //     //console.log(count+"new")

  // });
  // await //console.log(street.length);
  // return street;
  return 'poda panni    dfsd';
};

const streetAllocation = async (allocationbody) => {
  const { userId, arr } = allocationbody;
  // arr.forEach(async(e)=>{
  //   let  streetId = e
  //   const streets = await Street.findById(streetId)
  //   if(streets.AllocationStatus === "Allocated"){
  //     throw new ApiError(httpStatus.NOT_FOUND, "Street Already Allocated")
  //   }
  //    await Streets.updateOne({_id:streetId}, {AllocatedUser:userId, AllocationStatus:"Allocated"}, {new:true})
  // })
};

const getAllocatedStreeOnly = async () => {
  const street = await Streets.find({ AllocationStatus: 'Allocated' });
  return street;
};

const getAllDeAllocatedStreetOnly = async () => {
  const street = await Streets.find({ AllocationStatus: 'DeAllocated' });
  return street;
};

const getAllStreetById = async (id) => {
  return await Streets.aggregate([
    { $sort: { order: 1 } },
    {
      $match: {
        $and: [{ AllocatedUser: { $eq: id } }, { AllocationStatus: { $ne: 'DeAllocated' } }, { order: { $ne: null } }],
      },
    },
    {
      $project: {
        street: 1,
        order: 1,
      },
    },
  ]);
};

const getaggregationByUserId = async (AllocatedUser) => {
  return await Streets.aggregate([
    {
      $match: {
        $and: [{ AllocatedUser: { $eq: AllocatedUser }, AllocationStatus: { $ne: 'DeAllocated' } }],
      },
    },
    {
      $lookup: {
        from: 'manageusers',
        localField: 'AllocatedUser',
        foreignField: '_id',
        as: 'manageusersData',
      },
    },
    {
      $unwind: '$manageusersData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'wardId',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'zone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'shops',
        let: { street: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$$street', '$Strid'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'shopData',
      },
    },
    {
      $lookup: {
        from: 'apartments',
        let: { street: '$_id' },

        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$$street', '$Strid'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'apartmentData',
      },
    },
    {
      $project: {
        wardName: '$wardData.ward',
        id: 1,
        zoneName: '$zonesData.zone',
        street: 1,
        apartMent: '$apartmentData',
        closed: 1,
        shop: '$shopData',
        manageUserId: '$manageusersData._id',
      },
    },
  ]);
};

const getDeAllocationaggregationByUserId = async (AllocatedUser) => {
  // return await Streets.aggregate([
  //   {
  //     $match: {
  //       $and: [{ AllocatedUser: { $eq: AllocatedUser }, AllocationStatus:{$eq:"DeAllocated"} }],
  //     },
  //   },
  //   {
  //     $lookup:{
  //       from: 'wards',
  //       localField: 'wardId',
  //       foreignField: '_id',
  //       as: 'wardData',
  //     }
  //   },
  //   {
  //     $unwind:'$wardData'
  //   },
  //   {
  //     $lookup:{
  //       from: 'zones',
  //       localField: 'zone',
  //       foreignField: '_id',
  //       as: 'zonesData',
  //     }
  //   },
  //   {
  //     $unwind:'$zonesData'
  //   },
  //   {
  //     $lookup:{
  //       from: 'shops',
  //       let:{'street':'$_id'},

  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $eq: ["$$street", "$Strid"],  // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
  //             },
  //           },
  //         },
  //       ],
  //       as: 'shopData',
  //     }
  //   },
  //   {
  //     $lookup:{
  //       from: 'apartments',
  //       let:{'street':'$_id'},

  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $eq: ["$$street", "$Strid"],  // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
  //             },
  //           },
  //         },
  //       ],
  //       as: 'apartmentData',
  //     }
  //   },
  //   {
  //     $project: {
  //       wardName:'$wardData.ward',
  //       id:1,
  //       zoneName:'$zonesData.zone',
  //       street:1,
  //       apartMent:'$apartmentData',
  //       closed:1,
  //       shop:'$shopData'
  //     },
  //   },
  // ]);
  //console.log(AllocatedUser);
};

const streetDeAllocation = async (allocationbody) => {
  const { userId, arr } = allocationbody;
  let array = [];
  // for(let i=0;i<arr.length;i++){
  //   const check = await Apartment.find({Strid:arr[0]})
  //   const check1 = await Shop.find({Strid:arr[0]})
  //   if(check.length != 0){
  //     throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Street Already allocated Apartment or Shop');
  //   }
  //   if(check1.length != 0){
  //     throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Street Already allocated Apartment or Shop');
  //   }
  // }
  for (let i = 0; i < arr.length; i++) {
    const check = await Apartment.find({ Strid: arr[i] });
    const check1 = await Shop.find({ Strid: arr[i] });
    if (check.length != 0) {
      const street = await Street.find({ _id: check[0].Strid });
      array.push(street[0].street);
    }
    if (check1.length != 0) {
      const street = await Street.find({ _id: check1[0].Strid });
      array.push(street[0].street);
    }
  }
  if (array != 0) {
    return {
      data: [...new Set(array)],
      errorMessage: 'Already allocated Apartment or Shop',
    };
  } else {
    arr.forEach(async (e) => {
      let streetId = e;

      await Streets.updateOne(
        { _id: streetId },
        { DeAllocatedUser: userId, AllocationStatus: 'DeAllocated' },
        { new: true }
      );
    });
    return `Street DeAllocated SuccessFully`;
  }
};

const getwardBystreetAngular = async (wardId) => {
  let match;
  if (wardId != 'null') {
    match = [{ wardId: { $eq: wardId } }];
  }
  const ress = await Street.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    { $sort: { street: 1 } },
  ]);
  return ress;
};

const getWardByStreet = async (wardId, status) => {
  //console.log(status);
  let match;
  if (status != 'null') {
    match = [{ wardId: { $eq: wardId }, AllocationStatus: { $eq: status } }];
  } else {
    match = [{ wardId: { $eq: wardId }, AllocationStatus: { $ne: 'Allocated' } }];
  }
  const ress = await Street.aggregate([
    {
      $match: {
        $and: match,
      },
    },
  ]);
  //console.log('Total Street Find : ' + ress.length);
  return ress;
};

const getAllStreet = async () => {
  return Street.aggregate([
    {
      $lookup: {
        from: 'zones',
        localField: 'zone',
        foreignField: '_id',
        as: 'zoneData',
      },
    },
    {
      $unwind: '$zoneData',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'district',
        foreignField: '_id',
        as: 'districtData',
      },
    },
    {
      $unwind: '$districtData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'wardId',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $project: {
        districtName: '$districtData.district',
        zoneName: '$zoneData.zone',
        // district:"$districtData.district",
        // zoneId:"$zoneData._id",
        wardNo: '$wardData.wardNo',
        zoneCode: '$zoneData.zoneCode',
        wardName: '$wardData.ward',
        street: 1,
        _id: 1,
      },
    },
    { $limit: 10 },
  ]);
};

// pagination with Aggregation

const streetPagination = async (key, id) => {
  let match = [{ archive: { $ne: true } }];
  if (key != 'null') {
    match = [
      { area: { $regex: key, $options: 'i' } },
      { street: { $regex: key, $options: 'i' } },
      { locality: { $regex: key, $options: 'i' } },
    ];
  }
  //console.log(match);
  return Street.aggregate([
    {
      $match: {
        $or: match,
      },
    },
    {
      $sort: { locality: 1 },
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'zone',
        foreignField: '_id',
        as: 'zoneData',
      },
    },
    {
      $unwind: '$zoneData',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'district',
        foreignField: '_id',
        as: 'districtData',
      },
    },
    {
      $unwind: '$districtData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'wardId',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $project: {
        districtName: '$districtData.district',
        zoneName: '$zoneData.zone',
        // district:"$districtData.district",
        // zoneId:"$zoneData._id",
        wardNo: '$wardData.wardNo',
        zoneCode: '$zoneData.zoneCode',
        wardName: '$wardData.ward',
        locality: 1,
        area: 1,
        street: 1,
        _id: 1,
      },
    },
    { $skip: 20 * id },
    { $limit: 20 },
  ]);
};

const getStreetByWardId = async (wardId) => {
  //console.log(wardId);
  const street = await Street.find({ wardId }).sort({ street: 1 });
  if (!street === null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'WardId Is Incorrect');
  }
  return street;
};

const queryStreet = async (filter, options) => {
  return Street.paginate(filter, options);
};

const updateStreetById = async (streetId, updateBody) => {
  //console.log(streetId);
  let street = await getStreetById(streetId);
  if (!street) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Street not found');
  }
  //console.log(street);
  street = await Street.findByIdAndUpdate({ _id: streetId }, updateBody, { new: true });
  return street;
};

const closedStatus = async (streetId, updatebody) => {
  let street = await getStreetById(streetId);
  if (!street) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Street Not Found');
  }
  street = await Street.findByIdAndUpdate({ _id: streetId }, updatebody, { new: true });
  return street;
};

const deleteStreetById = async (streetId) => {
  //console.log(streetId);
  const street = await getStreetById(streetId);
  if (!street) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Street not found');
  }
  (street.active = false), (street.archive = true), await street.save();
  return street;
};

const areaSearchApi = async (key) => {
  let values = await Street.aggregate([
    {
      $match: {
        $or: [
          { area: { $regex: key, $options: 'i' } },
          { street: { $regex: key, $options: 'i' } },
          { locality: { $regex: key, $options: 'i' } },
        ],
      },
    },

    {
      $lookup: {
        from: 'wards',
        localField: 'wardId',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'zone',
        foreignField: '_id',
        as: 'zoneData',
      },
    },
    {
      $unwind: '$zoneData',
    },
    {
      $project: {
        _id: 1,
        street: 1,
        area: 1,
        locality: 1,
        wardName: '$wardData.ward',
        zone: '$zoneData.zone',
        zoneCode: '$zonesData.zoneCode',
      },
    },
    {
      $limit: 100,
    },
  ]);
  return values;
};

const getDummy = async () => {
  const dummystreet = await Streets.find({ dommy: true });
  return dummystreet;
  // return 'summa';
};

// const rename = async()=>{
//   const reName = await Streets.find();
// }

// const getStreetByWard = async (wardId) => {
//   //console.log(wardId);
//   const street = await Street.find({ dommy: { $ne: true }, wardId: { $eq: wardId } });
//   return street;
// };

// const rename = async (body) => {
//   // //console.log(body);
//   let streetData = await Street.findById(body.sId);
//   //console.log(streetData);
//   if (body.type == 'rename') {
//     await Street.findByIdAndUpdate(
//       { _id: body.sId },
//       { modifiedName: streetData.street, street: body.Sname, locality: body.loc, area: body.area,district: body.selDis,zone : body.selZone, wardId:body.selWard, dommy:false, },
//       { new: true }
//     );
//   }
// if(body.type == 'redirect'){
//   await Street.findByIdAndUpdate({

//   })
// }

// let reName = await Street.create(body)
//   return streetData;
// };
const getStreetByWard = async (wardId) => {
  const street = await Street.find({ dommy: { $ne: true }, wardId: { $eq: wardId } });
  return street;
};



const getAllUnAssignedStreetandCount = async (wardId) => {
  const ress = await Street.aggregate([
    {
      $match: {
        $and: [{ wardId: { $eq: wardId } }],
      },
    },
    { $sort: { street: 1 } },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Strid',
        pipeline:[
          {
            $match: {
              $and: [{ Wardid: { $eq: wardId } }],
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
          // {
          //   $group: {
          //     _id: null,
          //     unAssignCount: { $sum: 1 },
          //   },
          // },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project:{
        street:1,
        count:{$size:'$b2bshopclonesdata'}
      }
    }
  ]);

  return ress;
};

const getTelecallerAllUnAssignedStreetandCount = async (wardId) => {
  const ress = await Street.aggregate([
    {
      $match: {
        $and: [{ wardId: { $eq: wardId } }],
      },
    },
    { $sort: { street: 1 } },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Strid',
        pipeline:[
          {
            $match: {
              $and: [{ Wardid: { $eq: wardId } }],
            },
          },
          {
            $match: {
              $or: [
                {
                  $and: [
                    { telecallerStatus: { $ne: 'Assign' } },
                    { telecallerStatus: { $ne: 'tempReassign' } },
                    { telecallerStatus: { $eq: 'Reassign' } },
                  ],
                },
                {
                  $and: [
                    { telecallerStatus: { $ne: 'Assign' } },
                    { telecallerStatus: { $ne: 'tempReassign' } },
                    { telecallerStatus: { $eq: null } },
                  ],
                },
              ],
            },
          },
          // {
          //   $group: {
          //     _id: null,
          //     unAssignCount: { $sum: 1 },
          //   },
          // },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project:{
        street:1,
        count:{$size:'$b2bshopclonesdata'}
      }
    }
  ]);

  return ress;
};

const getSalesmanAllUnAssignedStreetandCount = async (wardId) => {
  const ress = await Street.aggregate([
    {
      $match: {
        $and: [{ wardId: { $eq: wardId } }],
      },
    },
    { $sort: { street: 1 } },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Strid',
        pipeline:[
          {
            $match: {
              $and: [{ Wardid: { $eq: wardId } }],
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
          // {
          //   $group: {
          //     _id: null,
          //     unAssignCount: { $sum: 1 },
          //   },
          // },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project:{
        street:1,
        count:{$size:'$b2bshopclonesdata'}
      }
    }
  ]);

  return ress;
};

module.exports = {
  createStreet,
  getStreetById,
  getAllStreet,
  streetPagination,
  updates,
  getDeAllocationaggregationByUserId,
  getWardByStreet,
  getAllocatedStreeOnly,
  getAllDeAllocatedStreetOnly,
  getStreetByWardId,
  getaggregationByUserId,
  updateStreetById,
  streetAllocation,
  closedStatus,
  deleteStreetById,
  streetDeAllocation,
  getwardBystreetAngular,
  queryStreet,
  getAllStreetById,
  areaSearchApi,
  getDummy,
  // getStreetByWard,
  // rename,
  getAllUnAssignedStreetandCount,
  getTelecallerAllUnAssignedStreetandCount,
  getSalesmanAllUnAssignedStreetandCount,
};
