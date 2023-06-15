const httpStatus = require('http-status');
const { Apartment, Shop, ManageUserAttendance, ManageUserAttendanceAuto } = require('../models/apartmentTable.model');
const manageUser = require('../models/manageUser.model');
const ApiError = require('../utils/ApiError');
const Street = require('../models/street.model');
const { Market } = require('../models/market.model');
const street = require('../models/street.model');
const axios = require('axios');

const createApartment = async (apartmentBody) => {
  const { Uid } = apartmentBody;
  //console.log(apartmentBody);
  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = { ...apartmentBody, ...{ Uid: ManageUser.id } };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  //console.log(values);
  return Apartment.create(values);
};

const createManageUserAutoAttendance = async (manageUserAttendanceAutoBody) => {
  const { Uid } = manageUserAttendanceAutoBody;
  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = { ...manageUserAttendanceAutoBody, ...{ Uid: ManageUser.id } };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  //console.log(values);
  return ManageUserAttendanceAuto.create(values);
};

const getAllManageUserAutoAttendance = async () => {
  const user = ManageUserAttendanceAuto.find({ active: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageUserAttendanceAuto Not Found');
  }
  return user;
};

const getAllAttendance = async () => {
  const user = await ManageUserAttendance.find({ active: true });
  return user;
};

const groupMap = async (from, to) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from}&destinations=${to}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );
  // //console.log(response.data)
  return response.data;
};

const latitudeMap = async (location, radius, type, keyword) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&&type=${type}&keyword=${keyword}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );

  return response.data;
};

const WardNoApi = async (location) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );
  return response.data;
};

const WardApi = async (location) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );
  return response.data;
};

const WardApi2 = async (longi, lati, data1) => {
  let longitude = longi;
  let latitude = lati;
  // //console.log(longitude.length)
  let data = [];
  let data2 = data1;
  let response = await axios.get(
    'https://chennaicorporation.gov.in/gcc/citizen-details/location-service/assets/GCC_DIVISION.geojson'
  );

  //  //console.log(response.data.features.length )
  //  //console.log(response.data.features[0].geometry.coordinates[0])
  for (let i = 0; i < response.data.features.length; i++) {
    for (let j = 0; j < response.data.features[i].geometry.coordinates[0].length; j++) {
      let b = response.data.features[i].geometry.coordinates[0][j];
      // //console.log(b)
      let lon = b.slice(0, 1);
      let la = b.slice(1, 2);
      const first2Str = String(la).slice(0, 5);
      const second2Str = String(lon).slice(0, 5);
      const first2Num = first2Str;
      const second2Num = second2Str;
      if (first2Num == latitude && second2Num == longitude) {
        //console.log(second2Num);
        //console.log(Number(longitude));
        //console.log(first2Num);
        //console.log(Number(latitude));
        data = response.data.features[i].properties;
        break;
      }
    }
  }
  return data;
};

const streetSearchApi = async (searchArea) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchArea}&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );
  return response.data;
};

const streetSearchApi2 = async (searchArea) => {
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchArea}&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  );
  return response.data;
};

const getAllStreetLatLang = async () => {
  // let count = 0;

  // const data = await street.find().limit(30).skip(1)
  // data.forEach(async (e) => {
  //   let streetId = e._id
  //   let streets = e.street
  //   let area = e.area
  //   let t = "tamilnadu"
  //   let i = "india"
  //   // let response = await axios.get(
  //   //   `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${streets, area, t, i}&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`
  //   // );
  //   axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${streets + " " + area + " ," + t + " ," + i}&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=AIzaSyC4f71KgUy-ocpdfmadcNPy-wrVks4YSdY`).then(resp => {
  //     // //console.log(resp.data.candidates[0]);
  //     count++;
  //     if (resp.data.candidates[0].geometry.location.lat != undefined) {
  //       //console.log(count + "-", resp.data.candidates[0].geometry.location.lat, streets, area)
  //       //console.log(count + "-", resp.data.candidates[0].geometry.location.lng)
  //     }

  //   });

  //   // await street.findByIdAndUpdate({ _id: streetId }, {lat:response.data.candidates[0].geometry.location.lat, lng:response.data.candidates[0].geometry.location.lng}, { new: true });
  // });
  //  //console.log(response.data.candidates[0].geometry.location.lat)
  //  //console.log(response.data.candidates[0].geometry.location.lng)
  return 'data';
};

const AllCount = async () => {
  const userCount = await manageUser.find({ active: true });
  const street = await Street.aggregate([
    {
      $match: {
        $or: [{ AllocationStatus: { $eq: 'Allocated' } }, { AllocationStatus: { $eq: 'DeAllocated' } }],
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
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'manageusers',
        localField: 'AllocatedUser',
        foreignField: '_id',
        as: 'manageusersdata',
      },
    },
    {
      $unwind: '$manageusersdata',
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
      $match: {
        $or: [
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $eq: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $eq: [] } }] },
        ],
      },
    },
    {
      $project: {
        wardName: '$wardData.ward',
        id: 1,
        zoneName: '$zonesData.zone',
        zoneId: '$zonesData.zoneCode',
        street: 1,
        apartMent: '$apartmentData',
        closed: 1,
        shop: '$shopData',
        userName: '$manageusersdata.name',
        status: 1,
        manageUserId: '$manageusersdata._id',
      },
    },
  ]);
  const apartmentCount = await Apartment.find({ active: true });
  const shopCount = await Shop.find({ active: true });
  const market = await Market.find({ active: true });
  return {
    userCount: userCount.length,
    streetCount: street.length,
    apartmentCount: apartmentCount.length,
    shopCount: shopCount.length,
    marketCount: market.length,
  };
};

const getAllManageUserAutoAttendanceTable = async (id, date, page) => {
  let match;
  if (id != 'null' && date != 'null') {
    match = [{ Uid: { $eq: id } }, { date: { $eq: date } }, { active: { $eq: true } }];
  } else if (id != 'null') {
    match = [{ Uid: { $eq: id } }, { active: { $eq: true } }];
  } else if (date != 'null') {
    match = [{ date: { $eq: date } }, { active: { $eq: true } }];
  } else {
    match = [{ Uid: { $ne: null } }, { active: { $eq: true } }];
  }
  const user = await ManageUserAttendanceAuto.aggregate([
    { $sort: { date: -1, created: -1 } },
    {
      $match: {
        $and: match,
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
      $project: {
        userName: '$manageusersdata.name',
        mobileNumber: '$manageusersdata.mobileNumber',
        id: 1,
        date: 1,
        time: 1,
        Alat: 1,
        Along: 1,
        photoCapture: 1,
        baseImage: 1,
        created: 1,
        Uid: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const count = await ManageUserAttendanceAuto.aggregate([
    {
      $match: {
        $and: match,
      },
    },
  ]);
  return {
    data: user,
    count: count.length,
  };
};

const apartmentAggregation = async () => {
  return Apartment.aggregate([
    {
      $lookup: {
        from: 'street',
        localField: 'Strid',
        foreignField: '_id',
        as: 'apartmentData',
      },
    },
    {
      $unwind: '$apartmentData',
    },
    {
      $lookup: {
        from: 'shops',
        localField: 'Strid',
        foreignField: 'Strid',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $project: {
        ApartMent: '$apartmentData',
        // ShopData:"$shopData"
      },
    },
  ]);
};

const createManageUserAttendance = async (manageUserAttendanceBody) => {
  const { Uid } = manageUserAttendanceBody;
  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = { ...manageUserAttendanceBody, ...{ Uid: ManageUser.id } };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  //console.log(values);
  return ManageUserAttendance.create(values);
};

const attendancelat = async (id, date1, date2) => {
  let match;
  if (id != 'null' && date1 != 'null' && date2 != 'null') {
    match = [{ Uid: { $eq: id } }, { dateIso: { $gte: date1, $lt: date2 } }];
  } else {
    match = [{ Uid: { $eq: id } }];
  }
  //console.log(match);
  return ManageUserAttendance.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        Alat: 1,
        Along: 1,
      },
    },
  ]);
};
// const paginationManageUserAttendance = async (filter, options) => {
//   return ManageUserAttendance.paginate(filter, options);
// };
const getAllManageUSerAttendance = async (id, date, fromtime, totime, page) => {
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
  //console.log('les', from);
  //console.log('ge', to);
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
  //console.log(match);
  const Attendance = await ManageUserAttendance.aggregate([
    { $sort: { date: -1, time: -1 } },
    {
      $match: {
        $and: match,
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
      $project: {
        userName: '$manageusersdata.name',
        mobileNumber: '$manageusersdata.mobileNumber',
        id: 1,
        date: 1,
        time: 1,
        Alat: 1,
        Along: 1,
        photoCapture: 1,
        created: 1,
        Uid: 1,
        dateIso: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
    // { $sort : { time : -1} }
  ]);
  const count = await ManageUserAttendance.aggregate([
    {
      $match: {
        $and: match,
      },
    },
  ]);

  //console.log(Attendance);

  return {
    data: Attendance,
    count: count.length,
  };
};

const getSearch = async (manageUserAttendanceBody) => {
  //console.log(manageUserAttendanceBody);
  let ManageUser = await manageUser.find({ name: manageUserAttendanceBody.name });
  if (!ManageUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageUser not found');
  }
  return ManageUser;
};

const createShop = async (shopBody) => {
  const { Uid } = shopBody;

  let ManageUser = await manageUser.findById(Uid);
  let values = {};
  values = { ...shopBody, ...{ Uid: ManageUser.id } };
  if (ManageUser === null) {
    throw new ApiError(httpStatus.NO_CONTENT, '!oops 🖕');
  }
  //console.log(values);
  return Shop.create(values);
};

const getShopById = async (id) => {
  return Shop.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplistsData',
      },
    },
    {
      $unwind: '$shoplistsData',
    },
    {
      $project: {
        shopType: '$shoplistsData.shopList',
        SName: 1,
        SOwner: 1,
        SCont1: 1,
        status: 1,
      },
    },
  ]);
};

const getApartmentById = async (id) => {
  return Apartment.findById(id);
};

const getApartmentUserStreet = async (id, streetId) => {
  return await Apartment.aggregate([
    {
      $match: {
        $and: [{ Uid: { $eq: id }, Strid: { $eq: streetId } }],
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
      $lookup: {
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        // mobileNumber:"$manageusersdata.mobileNumber",
        id: 1,
        Uid: 1,
        photoCapture: 1,
        AName: 1,
        AType: 1,
        NFlat: 1,
        AFloor: 1,
        Alat: 1,
        Along: 1,
        fileSource: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        reason: 1,
      },
    },
  ]);
};
const getShopUserStreet = async (id, streetId) => {
  return await Shop.aggregate([
    {
      $match: {
        $and: [{ Uid: { $eq: id }, Strid: { $eq: streetId } }],
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
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        mobileNumber: '$manageusersdata.mobileNumber',
        _id: 1,
        Uid: 1,
        photoCapture: 1,
        SName: 1,
        SType: '$shoplistsdata.shopList',
        Slat: 1,
        Slong: 1,
        baseImage: 1,
        SOwner: 1,
        SCont1: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        streetId: '$streetsdata._id',
        reason: 1,
      },
    },
  ]);
};

const getAllApartment = async (id, districtId, zoneId, wardId, streetId, status, page) => {
  let match;
  let check = 'Pending';
  let check1 = 'Waiting';
  if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }, { status: { $eq: status } }];
  }
  ////
  else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  }
  //
  else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      ,
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      ,
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { Strid: { $eq: streetId } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }];
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId != 'null') &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId == 'null') &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Strid: { $eq: streetId } }];
  }
  //  else if(id =='null'&&districtId =='null'&&zoneId =='null'&& wardId=='null'&&streetId == 'null'&& status !='null'){
  //     match=[{ status:{ $eq: status}}]
  //  }
  else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredDistrict': { $eq: districtId } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [{ Strid: { $eq: streetId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    //console.log('wfd');
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { status: { $eq: status } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { status: { $eq: status } },
    ];
  } else {
    match = [{ _id: { $ne: null } }];
  }
  //console.log(match);
  const apart = await Apartment.aggregate([
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
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    // {
    //   $lookup:{
    //     from: 'zones',
    //    let:{"zoneNames":"$_id"},
    //    pipeline:[
    //      {
    //        $match:{
    //          $expr:{
    //            $eq:["$$streetsdata.zone","$$zoneNames"]
    //          }
    //        }
    //      }
    //    ],
    //    as:"zoneName"

    //   }
    // },
    // {
    //   $unwind:'$zoneName'
    // },
    {
      $lookup: {
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        // mobileNumber:"$manageusersdata.mobileNumber",
        id: 1,
        Uid: 1,
        photoCapture: 1,
        AName: 1,
        AType: 1,
        NFlat: 1,
        AFloor: 1,
        Alat: 1,
        Along: 1,
        fileSource: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        reason: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const count = await Apartment.aggregate([
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
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    // {
    //   $lookup:{
    //     from: 'zones',
    //    let:{"zoneNames":"$_id"},
    //    pipeline:[
    //      {
    //        $match:{
    //          $expr:{
    //            $eq:["$$streetsdata.zone","$$zoneNames"]
    //          }
    //        }
    //      }
    //    ],
    //    as:"zoneName"

    //   }
    // },
    // {
    //   $unwind:'$zoneName'
    // },
    {
      $lookup: {
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        // mobileNumber:"$manageusersdata.mobileNumber",
        id: 1,
        Uid: 1,
        photoCapture: 1,
        AName: 1,
        AType: 1,
        NFlat: 1,
        AFloor: 1,
        Alat: 1,
        Along: 1,
        fileSource: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        reason: 1,
      },
    },
  ]);

  return {
    data: apart,
    count: count.length,
  };
  // return apart;
};

const getAllShop = async (id, districtId, zoneId, wardId, streetId, status, page) => {
  let match;
  let check = 'Pending';
  let check1 = 'Waiting';
  if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }, { status: { $eq: status } }];
  }
  ////
  else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  }
  //
  else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      ,
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      ,
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { Strid: { $eq: streetId } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }];
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId != 'null') &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId == 'null') &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Strid: { $eq: streetId } }];
  }
  //  else if(id =='null'&&districtId =='null'&&zoneId =='null'&& wardId=='null'&&streetId == 'null'&& status !='null'){
  //     match=[{ status:{ $eq: status}}]
  //  }
  else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredDistrict': { $eq: districtId } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { Strid: { $eq: streetId } }];
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ Uid: { $eq: id } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { 'manageusersdata.preferredWard': { $eq: wardId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { Strid: { $eq: streetId } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    match = [{ Strid: { $eq: streetId } }, { status: { $eq: status } }];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [{ status: { $eq: status } }];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { 'streetsdata.closed': { $eq: null } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == check1
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'streetsdata.closed': { $eq: 'close' } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $ne: 'Approved' } },
      { status: { $ne: 'Rejected' } },
      { status: { $eq: '' } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    //console.log('wfd');
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { Strid: { $eq: streetId } },
      { status: { $eq: status } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { 'manageusersdata.preferredWard': { $eq: wardId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { status: { $eq: status } },
    ];
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { 'manageusersdata.preferredZone': { $eq: zoneId } },
      { status: { $eq: status } },
    ];
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    match = [
      { Uid: { $eq: id } },
      { 'manageusersdata.preferredDistrict': { $eq: districtId } },
      { status: { $eq: status } },
    ];
  } else {
    match = [{ _id: { $ne: null } }];
  }
  //console.log(match);
  const shop = await Shop.aggregate([
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
      $lookup: {
        from: 'zones',
        localField: 'manageusersdata.preferredZone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'manageusersdata.preferredWard',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        mobileNumber: '$manageusersdata.mobileNumber',
        _id: 1,
        Uid: 1,
        photoCapture: 1,
        SName: 1,
        SType: '$shoplistsdata.shopList',
        Slat: 1,
        Slong: 1,
        baseImage: 1,
        SOwner: 1,
        SCont1: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        streetId: '$streetsdata._id',
        reason: 1,
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);

  const count = await Shop.aggregate([
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
      $lookup: {
        from: 'zones',
        localField: 'manageusersdata.preferredZone',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'manageusersdata.preferredWard',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        userName: '$manageusersdata.name',
        streetName: '$streetsdata.street',
        mobileNumber: '$manageusersdata.mobileNumber',
        _id: 1,
        Uid: 1,
        photoCapture: 1,
        SName: 1,
        SType: '$shoplistsdata.shopList',
        Slat: 1,
        Slong: 1,
        baseImage: 1,
        SOwner: 1,
        SCont1: 1,
        zoneName: '$zonesData.zone',
        wardName: '$wardsData.ward',
        status: 1,
        date: 1,
        time: 1,
        created: 1,
        streetStatus: '$streetsdata.closed',
        reason: 1,
      },
    },
  ]);
  return {
    data: shop,
    count: count.length,
  };
};

const getAllApartmentAndShop = async (id, districtId, zoneId, wardId, streetId, status, page) => {
  let mat;
  if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { _id: { $eq: streetId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }] };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }] };
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId != 'null') &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredZone': { $eq: zoneId } }] };
  } else if (
    id == 'null' &&
    (districtId == 'null') & (zoneId == 'null') &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredWard': { $eq: wardId } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ _id: { $eq: streetId } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ filter: { $eq: status } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { _id: { $eq: streetId } }, { filter: { $eq: status } }] };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { _id: { $eq: streetId } },
        { filter: { $eq: status } },
      ],
    };
  }
  //  pooda panni
  else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { _id: { $eq: streetId } },
        { filter: { $eq: status } },
      ],
    };
  }
  // sdef
  else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { filter: { $eq: status } }] };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { filter: { $eq: status } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { 'manageusersdata.preferredDistrict': { $eq: districtId } }] };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata._id': { $eq: id } },
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { _id: { $eq: streetId } },
      ],
    };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { _id: { $eq: streetId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { _id: { $eq: streetId } }] };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredDistrict': { $eq: districtId } }, { filter: { $eq: status } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { 'manageusersdata.preferredZone': { $eq: zoneId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { 'manageusersdata.preferredWard': { $eq: wardId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { _id: { $eq: streetId } }] };
  } else if (
    id != 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata._id': { $eq: id } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { 'manageusersdata.preferredWard': { $eq: wardId } }],
    };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { _id: { $eq: streetId } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId != 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredZone': { $eq: zoneId } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { _id: { $eq: streetId } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ 'manageusersdata.preferredWard': { $eq: wardId } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId != 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ _id: { $eq: streetId } }, { filter: { $eq: status } }] };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId == 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId != 'null' &&
    zoneId != 'null' &&
    wardId != 'null' &&
    streetId != 'null' &&
    status == 'null'
  ) {
    mat = {
      $and: [
        { 'manageusersdata.preferredDistrict': { $eq: districtId } },
        { 'manageusersdata.preferredZone': { $eq: zoneId } },
        { 'manageusersdata.preferredWard': { $eq: wardId } },
        { _id: { $eq: streetId } },
      ],
    };
  } else if (
    id == 'null' &&
    districtId == 'null' &&
    zoneId == 'null' &&
    wardId == 'null' &&
    streetId == 'null' &&
    status != 'null'
  ) {
    mat = { $and: [{ filter: { $eq: status } }] };
  } else {
    mat = { $and: [{ _id: { $ne: null } }] };
  }
  //console.log(mat);
  const street = await Street.aggregate([
    {
      $match: {
        $or: [{ AllocationStatus: { $eq: 'Allocated' } }, { AllocationStatus: { $eq: 'DeAllocated' } }],
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
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $lookup: {
        from: 'manageusers',
        localField: 'AllocatedUser',
        foreignField: '_id',
        as: 'manageusersdata',
      },
    },
    {
      $unwind: '$manageusersdata',
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
    // {
    //   $match: {
    //     $and: mat,
    //    }
    //   },
    // {
    //   $match: {
    //     $and: [{'shopData':{$type: 'array', $ne: []}},{'apartmentData':{$type: 'array', $ne: []}}],
    //    }
    //   },
    //  {
    //   $match: {
    //     $and: [{'shopData':{$type: 'array', $eq: []}},{'apartmentData':{$type: 'array', $ne: []}}],
    //    }
    //   },
    // {
    //   $match: {
    //     $and: [{'shopData':{$type: 'array', $ne: []}},{'apartmentData':{$type: 'array', $eq: []}}],
    //    }
    //   },
    {
      $match: {
        $or: [
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $eq: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $eq: [] } }] },
        ],
      },
    },
    {
      $match: mat,
    },
    {
      $project: {
        wardName: '$wardData.ward',
        id: 1,
        zoneName: '$zonesData.zone',
        zoneId: '$zonesData.zoneCode',
        street: 1,
        apartMent: '$apartmentData',
        closed: 1,
        shop: '$shopData',
        userName: '$manageusersdata.name',
        status: 1,
        manageUserId: '$manageusersdata._id',
        closeDate: 1,
        filter: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const count = await Street.aggregate([
    {
      $match: {
        $or: [{ AllocationStatus: { $eq: 'Allocated' } }, { AllocationStatus: { $eq: 'DeAllocated' } }],
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
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },

    {
      $lookup: {
        from: 'manageusers',
        localField: 'AllocatedUser',
        foreignField: '_id',
        as: 'manageusersdata',
      },
    },
    {
      $unwind: '$manageusersdata',
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
    // {
    //   $match: {
    //     $and: mat,
    //    }
    //   },
    // {
    //   $match: {
    //     $and: [{'shopData':{ $ne:null}},{'apartmentData':{ $ne:null}}],
    //    }
    //   },
    {
      $match: {
        $or: [
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $eq: [] } }, { apartmentData: { $type: 'array', $ne: [] } }] },
          { $and: [{ shopData: { $type: 'array', $ne: [] } }, { apartmentData: { $type: 'array', $eq: [] } }] },
        ],
      },
    },
    {
      $match: mat,
    },
    {
      $project: {
        wardName: '$wardData.ward',
        id: 1,
        zoneName: '$zonesData.zone',
        zoneId: '$zonesData.zoneCode',
        street: 1,
        apartMent: '$apartmentData',
        closed: 1,
        shop: '$shopData',
        userName: '$manageusersdata.name',
        closeDate: 1,
      },
    },
  ]);
  return {
    data: street,
    count: count.length,
  };
  // return street
};

const updateApartmentById = async (apartmentId, updateBody) => {
  let Apart = await getApartmentById(apartmentId);
  if (!Apart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Apartment not found');
  }
  Apart = await Apartment.findByIdAndUpdate({ _id: apartmentId }, updateBody, { new: true });
  //console.log(Apart.Strid);
  let app = await Street.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: Apart.Strid }, closed: { $eq: 'close' } }],
      },
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
          {
            $match: {
              $expr: {
                $eq: ['', '$status'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
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
          {
            $match: {
              $expr: {
                $eq: ['', '$status'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'apartmentData',
      },
    },
  ]);
  //console.log(app);
  let filter = '';
  if (app.length != 0) {
    if (app[0].shopData.length == 0 && app[0].apartmentData.length == 0) {
      filter = 'completed';
    } else if (app[0].shopData.length != 0 || app[0].apartmentData.length != 0) {
      filter = 'partialpending';
    }
  }
  //console.log(Apart.Strid);
  if (filter != '') {
    await Street.findByIdAndUpdate({ _id: Apart.Strid }, { filter: filter }, { new: true });
  }
  return Apart;
};

const updateShopById = async (shopId, updateBody) => {
  let Sho = await getShopById(shopId);
  if (!Sho) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  Sho = await Shop.findByIdAndUpdate({ _id: shopId }, updateBody, { new: true });
  let app = await Street.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: Sho.Strid }, closed: { $eq: 'close' } }],
      },
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
          {
            $match: {
              $expr: {
                $eq: ['', '$status'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
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
          {
            $match: {
              $expr: {
                $eq: ['', '$status'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'apartmentData',
      },
    },
  ]);
  //console.log(app);
  let filter = '';
  if (app.length != 0) {
    if (app[0].shopData.length == 0 && app[0].apartmentData.length == 0) {
      filter = 'completed';
    } else if (app[0].shopData.length != 0 || app[0].apartmentData.length != 0) {
      filter = 'partialpending';
    }
  }
  // //console.log(Apart.Strid)
  if (filter != '') {
    await Street.findByIdAndUpdate({ _id: Sho.Strid }, { filter: filter }, { new: true });
  }
  return Sho;
};

const deleteapartmentById = async (apartmentId) => {
  const Apart = await getApartmentById(apartmentId);
  if (!Apart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Apartment not found');
  }
  (Apart.archive = true), (Apart.active = false), await Apart.save();
  return Apart;
};

const deleteShopById = async (shopId) => {
  const Sho = await getApartmentById(shopId);
  if (!Sho) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  (Sho.archive = true), (Sho.active = false), await Sho.save();
  return Sho;
};

const chennai_corporation_decodes = async () => {
  let response = await axios.get(
    `https://chennaicorporation.gov.in/gcc/citizen-details/location-service-lb/assets/GCC_DIVISION.geojson`
  );
  //console.log(
  //   response.data.features.array.foreach((element) => {
  //     return element.geometry;
  //   })
  // );
  return response.data;
};

module.exports = {
  createApartment,
  createShop,
  getShopById,
  getApartmentById,
  getAllApartment,
  getAllShop,
  apartmentAggregation,
  updateApartmentById,
  updateShopById,
  deleteapartmentById,
  deleteShopById,
  createManageUserAttendance,
  getAllManageUSerAttendance,
  getSearch,
  getAllApartmentAndShop,
  getAllAttendance,
  createManageUserAutoAttendance,
  getAllManageUserAutoAttendance,
  getAllManageUserAutoAttendanceTable,
  AllCount,
  attendancelat,
  getApartmentUserStreet,
  getShopUserStreet,
  groupMap,
  latitudeMap,
  WardNoApi,
  WardApi2,
  streetSearchApi,
  streetSearchApi2,
  WardApi,
  getAllStreetLatLang,
  chennai_corporation_decodes,
  // paginationManageUserAttendance,
};
