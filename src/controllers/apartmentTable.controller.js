const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const apartmentTableService = require('../services/apartmentTable.service');
const axios = require('axios');

const createapartmentTableService = catchAsync(async (req, res) => {
  const apart = await apartmentTableService.createApartment(req.body);
  if (req.files) {
    req.files.forEach(function (files, index, arr) {
      apart.photoCapture.push('images/apartment/' + files.filename);
    });
  }
  //console.log(apart);
  res.send(apart);
  await apart.save();
});

const createManageUserAttendanceService = catchAsync(async (req, res) => {
  const Attendance = await apartmentTableService.createManageUserAttendance(req.body);

  res.status(httpStatus.CREATED).send(Attendance);
  await Attendance.save();
});

const getAllCount = catchAsync(async (req, res) => {
  const user = await apartmentTableService.AllCount();
  res.send(user);
});

// thirdPartyApis

const groupMapService = catchAsync(async (req, res) => {
  const user = await apartmentTableService.groupMap(req.params.from, req.params.to);
  res.send(user);
});

const WardApi = catchAsync(async (req, res) => {
  const user = await apartmentTableService.WardNoApi(req.params.location);
  res.send(user);
});

const wardApiWardApi = catchAsync(async (req, res) => {
  const user = await apartmentTableService.WardApi(req.params.location);
  res.send(user);
});

const WardNoApi2 = catchAsync(async (req, res) => {
  const user = await apartmentTableService.WardApi2(req.params.longi, req.params.lati, req.params.data);
  res.send(user);
});

const getWardDataForDB = async (req, res, next) => {
  const countriesJSON = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json';

  try {
    let responseCountry = await axios.get(countriesJSON);
    let countryList = responseCountry.data.map((e) => {
      return {
        label: e.name.toUpperCase(),
        name: e.id,
      };
    });

    await res.status(200).json({
      success: true,
      data: countryList,
    });
  } catch (err) {
    next(err);
  }
};

const locationMapService = catchAsync(async (req, res) => {
  const user = await apartmentTableService.latitudeMap(
    req.params.location,
    req.params.radius,
    req.params.type,
    req.params.keyword
  );
  res.send(user);
});

// thirdPartyApis
const getAllLATLONG = catchAsync(async (req, res) => {
  const data = await apartmentTableService.getAllStreetLatLang();
  res.send(data);
});

const getAllSearchApi = catchAsync(async (req, res) => {
  const cate = await apartmentTableService.streetSearchApi(req.params.searchArea);
  res.send(cate);
});

const getAllSearchApi2 = catchAsync(async (req, res) => {
  const cate = await apartmentTableService.streetSearchApi2(req.params.searching);
  res.send(cate);
});

const getAllmanageUserAttendanceAuto = catchAsync(async (req, res) => {
  const cate = await apartmentTableService.getAllManageUserAutoAttendance();
  res.send(cate);
});

const createManageUserAttendanceAutoService = catchAsync(async (req, res) => {
  const Attendance = await apartmentTableService.createManageUserAutoAttendance(req.body);
  res.status(httpStatus.CREATED).send(Attendance);
  await Attendance.save();
});

// const getManageUserAttendance = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'role']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await apartmentTableService.paginationManageUserAttendance(filter, options);
//   res.send(result);
// });
const getmanageUSerAttendanceAll = catchAsync(async (req, res) => {
  //console.log(req.params.totime);

  const attend = await apartmentTableService.getAllManageUSerAttendance(
    req.params.id,
    req.params.date,
    req.params.fromtime,
    req.params.totime,
    req.params.page
  );
  //console.log(req.params.fromtime, 'dfgdd');
  if (!attend) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(attend);
});

const getmanageUSerAttendanceAllAutoTable = catchAsync(async (req, res) => {
  const attend = await apartmentTableService.getAllManageUserAutoAttendanceTable(
    req.params.id,
    req.params.date,
    req.params.page
  );
  if (!attend) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(attend);
});

const getAllAttendance = catchAsync(async (req, res) => {
  const attendance = await apartmentTableService.getAllAttendance();
  //console.log(attendance);
  res.send(attendance);
});

const getApartmentUserAndStreet = catchAsync(async (req, res) => {
  const apart = await apartmentTableService.getApartmentUserStreet(req.params.id, req.params.streetId);
  if (!apart) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(apart);
});

const getShopUserAndStreet = catchAsync(async (req, res) => {
  const shop = await apartmentTableService.getShopUserStreet(req.params.id, req.params.streetId);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(shop);
});

const getAttendanceLong = catchAsync(async (req, res) => {
  const atten = await apartmentTableService.attendancelat(req.params.id, req.params.date1, req.params.date2);
  if (!atten) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(atten);
});

const getallShopApartment = catchAsync(async (req, res) => {
  const shopApart = await apartmentTableService.getAllApartmentAndShop(
    req.params.id,
    req.params.districtId,
    req.params.zoneId,
    req.params.wardId,
    req.params.streetId,
    req.params.status,
    req.params.page
  );
  if (!shopApart) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(shopApart);
});
const createshopTableService = catchAsync(async (req, res) => {
  const shop = await apartmentTableService.createShop(req.body);

  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      shop.photoCapture.push('images/shop/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  // res.status(httpStatus.CREATED).send(shop);
  res.send(shop);
  await shop.save();
});

const getSearchUser = catchAsync(async (req, res) => {
  const search = await apartmentTableService.getSearch(req.body);
  res.send(search);
});

const getApartmentById = catchAsync(async (req, res) => {
  const apart = await apartmentTableService.getApartmentById(req.params.apartmentId);
  if (!apart || apart.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'apartment not found');
  }
  res.send(apart);
});

const getAllApartmentTable = catchAsync(async (req, res) => {
  const apart = await apartmentTableService.getAllApartment(
    req.params.id,
    req.params.districtId,
    req.params.zoneId,
    req.params.wardId,
    req.params.streetId,
    req.params.status,
    req.params.page
  );
  if (!apart) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(apart);
});

const getAllShop = catchAsync(async (req, res) => {
  const shop = await apartmentTableService.getAllShop(
    req.params.id,
    req.params.districtId,
    req.params.zoneId,
    req.params.wardId,
    req.params.streetId,
    req.params.status,
    req.params.page
  );
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(shop);
});

const getShopById = catchAsync(async (req, res) => {
  const shop = await apartmentTableService.getShopById(req.params.shopId);
  if (!shop || shop.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop not found');
  }
  res.send(shop);
});

const updateApartment = catchAsync(async (req, res) => {
  const apart = await apartmentTableService.updateApartmentById(req.params.apartmentId, req.body);
  if (req.files) {
    //   let path = [];
    //   //console.log(req.files)
    req.files.forEach(function (files, index, arr) {
      apart.photoCapture.push('images/apartment/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  //     //console.log(apart)
  // res.status(httpStatus.CREATED).send(apart);
  res.send(apart);
});

const shopApartmentAggregation = catchAsync(async (req, res) => {
  const shopApartment = await apartmentTableService.apartmentAggregation();
  res.send(shopApartment);
});

const updateShop = catchAsync(async (req, res) => {
  const shop = await apartmentTableService.updateShopById(req.params.shopId, req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      shop.photoCapture.push('images/shop/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  // res.status(httpStatus.CREATED).send(shop);
  res.send(shop);
});

const deleteApartment = catchAsync(async (req, res) => {
  await apartmentTableService.deleteapartmentById(req.params.apartmenPtId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteshop = catchAsync(async (req, res) => {
  await apartmentTableService.deleteShopById(req.params.shopId);
  res.status(httpStatus.NO_CONTENT).send();
});

const chennai_corporation_decodes = catchAsync(async (req, res) => {
  const decodes = await apartmentTableService.chennai_corporation_decodes();
  let data = JSON.stringify(decodes);
  res.json(data);
});

module.exports = {
  createapartmentTableService,
  createshopTableService,
  getApartmentById,
  getShopById,
  updateApartment,
  updateShop,
  deleteApartment,
  getAllAttendance,
  deleteshop,
  getAllShop,
  getAllApartmentTable,
  createManageUserAttendanceService,
  getmanageUSerAttendanceAll,
  shopApartmentAggregation,
  getSearchUser,
  getallShopApartment,
  createManageUserAttendanceAutoService,
  getAllmanageUserAttendanceAuto,
  getmanageUSerAttendanceAllAutoTable,
  getAllCount,
  getAttendanceLong,
  getApartmentUserAndStreet,
  getShopUserAndStreet,
  groupMapService,
  locationMapService,
  WardApi,
  WardNoApi2,
  getWardDataForDB,
  getAllSearchApi,
  getAllSearchApi2,
  wardApiWardApi,
  getAllLATLONG,
  chennai_corporation_decodes,
  // getManageUserAttendance,
};
