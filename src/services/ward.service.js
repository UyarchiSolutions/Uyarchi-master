const httpStatus = require('http-status');
const { Ward } = require('../models');
const Zone = require('../models/zone.model');
const ApiError = require('../utils/ApiError');
const Street = require('../models/street.model');

const createWard = async (wardBody) => {
  const { zone, zoneId } = wardBody;
  //console.log(zoneId);
  let zon = await Zone.findById(zoneId);
  if (zon === null) {
    throw new ApiError(httpStatus.NOT_FOUND, '! 😞oops');
  }
  return Ward.create(wardBody);
};

const getWardById = async (id, active) => {
  const ward = await Ward.findById(id);
  return ward;
};

const getAllWard = async () => {
  return Ward.aggregate([
    { $sort: { ward: 1 } },
    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
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
      $project: {
        districtName: '$districtData.district',
        zoneName: '$zoneData.zone',
        zoneCode: '$zoneData.zoneCode',
        district: 1,
        zoneId: 1,
        ward: 1,
        wardNo: 1,
      },
    },
  ]);
};

const getWardByZoneId = async (zoneId) => {
  //console.log('asrgl;y jkdfn', zoneId);
  const zone = await Ward.aggregate([
    {
      $sort: { ward: 1 },
    },
    {
      $match: {
        $and: [{ zoneId: { $eq: zoneId } }],
      },
    },
  ]);
  return zone;
};

const getWardByZoneIdBySalesman = async (zoneId) => {
  //console.log('asdfg', zoneId);
  const zone = await Ward.aggregate([
    {
      $sort: { ward: 1 },
    },
    {
      $match: {
        $and: [{ district: { $eq: zoneId } }],
      },
    },
  ]);
  return zone;
};

const wardPagination = async (id) => {
  //console.log(id);
  return Ward.aggregate([
    {
      $sort: {
        ward: 1,
      },
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
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
      $project: {
        districtName: '$districtData.district',
        zoneName: '$zoneData.zone',
        zoneCode: '$zoneData.zoneCode',
        district: 1,
        zoneId: 1,
        ward: 1,
        wardNo: 1,
      },
    },
    { $skip: 20 * id },
    { $limit: 20 },
  ]);
};

const getAllWardsForManageTrends = async () => {
  return await Ward.aggregate([
    {
      $sort: {
        ward: 1,
      },
    },
  ]);
};

const querWard = async (filter, options) => {
  return Ward.paginate(filter, options);
};

const updatewardById = async (wardId, updateBody) => {
  let ward = await getWardById(wardId);
  if (!ward) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ward not found');
  }
  ward = await Ward.findByIdAndUpdate({ _id: wardId }, updateBody, { new: true });
  return ward;
};

const deleteWardById = async (wardId) => {
  const ward = await getWardById(wardId);
  if (!ward) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ward not found');
  }
  (ward.active = false), (ward.archive = true), await ward.save();
  return ward;
};

const createDummyStreet = async () => {
  // let ward = await Ward.find().sort({ ward: 1 }).skip(0).limit(100);
  // let count = 0;
  // let sort = 0;
  // const deletes =await Street.find({ dommy: true })
  // deletes.forEach(async (e) => {
  //   await Street.findByIdAndDelete({ _id: e._id });
  // });
  // ward.forEach(async (e) => {
  //   let arra = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  //   arra.forEach(async() => {
  //     count++;
  //     sort++;
  //     let street = 'A' + count;
  //     const zone = e.zoneId;
  //     const district = e.district;
  //     const wardId = e._id;
  //     const row = {
  //       zone: zone,
  //       district: district,
  //       wardId: wardId,
  //       street: street,
  //       dommy: true,
  //       sort:sort
  //     };
  //     //console.log(row);

  //     // await Street.create(row);
  //   });
  // });
  // //console.log(count);
  return await Street.find({ dommy: true }).sort({ sort: 1 });
};

const getAllward = async () => {
  return await Ward.find();
};

const wardParticularZoneData  = async (id, Uid) => {
  let user;
  if(Uid != 'null'){
    user = [{Uid:{$eq:Uid}}]
  }else{
    user = [{_id:{$ne:null}}]
  }
    const data = await Ward.aggregate([
      { $match: { zoneId: id } },
      {
        $lookup: {
          from: 'b2bshopclones',
          localField: '_id',
          foreignField: 'Wardid',
          pipeline:[
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
            $match: {
              $and:user
            },
          }
          //      {
          //   $group: {
          //     _id: null,
          //     unAssignCount: { $sum: 1 },
          //   },
          // },
          ],
          as: 'b2bshopclones',
        },
      },
      // {
      //   $unwind:"$b2bshopclones"
      // },
      {
        $project:{
          ward:1,
          count:{ $size: '$b2bshopclones' },
          // count:"$b2bshopclones.unAssignCount"
        }
      }
    ])
    return data;
}


const wardParticularZoneData_only  = async (id) => {
    const data = await Ward.aggregate([
      { $match: { zoneId: id } },
      {
        $project:{
          ward:1,
        }
      }
    ])
    return data;
}

module.exports = {
  createWard,
  getWardByZoneId,
  getWardById,
  getAllWard,
  updatewardById,
  deleteWardById,
  wardPagination,
  getAllWardsForManageTrends,
  createDummyStreet,
  getWardByZoneIdBySalesman,
  getAllward,
  wardParticularZoneData,
  wardParticularZoneData_only,
};
