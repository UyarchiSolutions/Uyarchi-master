const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const wardAdminRoleService = require('../services/wardAdminRole.service');

const createwardAdminRoleService = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createwardAdminRole(req.body);
  res.send(data);
});

const getAllwardAdminRole = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAll(req.params.date);
  res.send(data);
});

const getDataById = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getWardAdminRoleById(req.params.id);
  if (!data || data.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wardAdminRole Not Found');
  }
  res.send(data);
});

const createwardAdminRoleAsmService = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createwardAdminRoleAsm(req.body);
  res.status(httpStatus.CREATED).send(data);
});

const getAllWardAdminRoleData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllWardAdminRoleData(req.params.id);
  if (!data || data.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wardAdminRole Not Found');
  }
  res.send(data);
});

const smData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.smData(req.params.date);
  res.send(data);
});

const total = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.total(req.params.id, req.body);
  res.send(data);
});

const createAsmSalesman = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createAsmSalesman(req.body);
  res.send(data);
});

const allAsmSalesmanData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAsmSalesman(req.params.id);
  res.send(data);
});

const getAllAssignReassignData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.allAssignReassignSalesman(req.params.id);
  res.send(data);
});

const createSalesmanShop = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createSalesmanShop(req.body);
  res.send(data);
});

const getAllAssignSalesmanShopData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getSalesman(req.params.id);
  res.send(data);
});

// getAllSalesMandataCurrentdate
const getAllSalesMandataCurrentdate = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllSalesMandataCurrentdate(req.params.id);
  res.send(data);
});

// createwithoutoutAsmSalesman

const createwithoutoutAsmSalesman = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createwithoutoutAsmSalesman(req.body);
  res.status(httpStatus.CREATED).send(data);
});

const withoutoutAsmSalesmanCurrentDate = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.withoutoutAsmSalesmanCurrentDate(req.params.id);
  res.send(data);
});

const withoutoutAsmSalesman = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.withoutoutAsmSalesman(req.params.date);
  res.send(data);
});

const dataAllSalesManhistry = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.dataAllSalesManhistry(req.params.id);
  res.send(data);
});

const allocateDeallocateCount = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.allocateDealocateCount(req.params.id);
  res.send(data);
});

const createtemperaryAssigndata = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createtemperaryAssigndata(req.body);
  res.send(data);
});

const getAllTempReassigndata = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllTempReassigndata();
  res.send(data);
});

const getAssignData_by_SalesMan = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAssignData_by_SalesMan(req.params.page);
  res.send(data);
});

const get_Assign_data_By_SalesManId = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.get_Assign_data_By_SalesManId(req.params.id);
  res.send(data);
});

const getUsersWith_skiped = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getUsersWith_skiped(req.params.id);
  res.send(data);
});

const Return_Assign_To_SalesMan = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.Return_Assign_To_SalesMan(req.params.id);
  res.send(data);
});

const history_Assign_Reaasign_data = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.history_Assign_Reaasign_data(
    req.params.id,
    req.params.date,
    req.params.idSearch,
    req.params.tempid
  );
  res.send(data);
});
const getAllSalesmanShops = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllSalesmanShopsCount();
  res.send(data);
});

const getAllSalesmanShopsData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllSalesmanShopsData(req.params.id);
  res.send(data);
});

const getDataAll = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getDataAll(req.params.id);
  res.send(data);
});

const getAllAsmCurrentdata = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllAsmCurrentdata(req.params.id);
  res.send(data);
});

const createwithAsmwithoutAsm = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createwithAsmwithoutAsm(req.body);
  res.send(data);
});

const getwithAsmwithoutAsm = catchAsync(async (req, res) => {
  let data;
  if (req.params.type === 'withoutAsm') {
    data = await wardAdminRoleService.getwithAsmwithoutAsm(req.params.type, req.params.date);
  } else {
    data = await wardAdminRoleService.getwithAsmwithoutAsm1(req.params.type, req.params.date);
  }
  res.send(data);
});

const WardAdminRoleHistor = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.WardAdminRoleHistor(req.params.id, req.params.date, req.params.page);
  res.send(data);
});

const getAllWithAsmwithout = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllWithAsmwithout(req.params.sm, req.params.asm, req.params.date);
  res.send(data);
});

const asmdata = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.asmdata();
  res.send(data);
});

const asmSalesman = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.asmSalesman(req.params.id);
  res.send(data);
});

const telecallerHead = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.telecallerHead();
  res.send(data);
});

const wardwcce = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.wardwcce();
  res.send(data);
});

const getAlldataASm = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAlldataASm(req.params.id);
  res.send(data);
});

const getAllDatasalesmanDataAndAssign = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAllDatasalesmanDataAndAssign(req.params.id, req.params.date, req.params.page);
  res.send(data);
});

const getAlldataSalesmanandtele_wcce = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getAlldataSalesmanandtele_wcce(req.params.id);
  res.send(data);
});

const telecallernames = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.telecallernames();
  res.send(data);
});

const WardAdminRoleHistorydata = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.WardAdminRoleHistorydata(req.params.id, req.params.date);
  res.send(data);
});

const WardAdminRoledatas = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.WardAdminRoledatas(req.params.id, req.params.date, req.params.page);
  res.send(data);
});

const assignShopsSalesman = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.assignShopsSalesman(req.params.id, req.params.page);
  res.send(data);
});

const assignShopsSalesmandatewise = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.assignShopsSalesmandatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

const assignShopsOnlydatewise = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.assignShopsOnlydatewise(req.params.id, req.params.wardid, req.params.page);
  res.send(data);
});

const createtartget = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.createtartget(req.userId, req.body);
  res.send(data);
});

const get_user_target = catchAsync(async (req, res) => {
  //console.log(req.query.id);
  const data = await wardAdminRoleService.get_user_target(req.userId, req.query.id);
  res.send(data);
});

const getall_targets = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getall_targets(req.query);
  res.send(data);
});

const getusertarget = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.getusertarget(req.userId);
  res.send(data);
});

const getAssign_bySalesman = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await wardAdminRoleService.getAssign_bySalesman(userId);
  res.send(data);
});
const re_getAssign_bySalesman_final_customer= catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await wardAdminRoleService.re_getAssign_bySalesman_final_customer(userId);
  res.send(data);
});


const re_getAssign_bySalesman = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await wardAdminRoleService.re_getAssign_bySalesman(userId);
  res.send(data);
});


const overall_Count_And_Data = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.overall_Count_And_Data(req.params.id, req.params.uid);
  res.send(data);
});

const map1 = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.map1(req.params.id);
  res.send(data);
});

const map2 = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.map2(req.params.id);
  res.send(data);
});

const map3 = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.map3(req.params.id);
  res.send(data);
});

const assignData = catchAsync(async (req, res) => {
  const data = await wardAdminRoleService.assignData(req.params.id, req.params.uid);
  res.send(data);
});
module.exports = {
  getDataById,
  getAllwardAdminRole,
  createwardAdminRoleService,
  createwardAdminRoleAsmService,
  getAllWardAdminRoleData,
  smData,
  total,
  createAsmSalesman,
  allAsmSalesmanData,
  getAllAssignReassignData,
  createSalesmanShop,
  getAllAssignSalesmanShopData,
  getAllSalesMandataCurrentdate,
  createwithoutoutAsmSalesman,
  withoutoutAsmSalesmanCurrentDate,
  withoutoutAsmSalesman,
  dataAllSalesManhistry,
  allocateDeallocateCount,
  createtemperaryAssigndata,
  getAllTempReassigndata,
  getAssignData_by_SalesMan,
  get_Assign_data_By_SalesManId,
  getUsersWith_skiped,
  Return_Assign_To_SalesMan,
  history_Assign_Reaasign_data,
  getAllSalesmanShops,
  getAllSalesmanShopsData,
  getDataAll,
  getAllAsmCurrentdata,
  createwithAsmwithoutAsm,
  getwithAsmwithoutAsm,
  WardAdminRoleHistor,
  getAllWithAsmwithout,
  asmdata,
  asmSalesman,
  telecallerHead,
  wardwcce,
  getAlldataASm,
  getAllDatasalesmanDataAndAssign,
  getAlldataSalesmanandtele_wcce,
  telecallernames,
  WardAdminRoleHistorydata,
  WardAdminRoledatas,
  assignShopsSalesman,
  assignShopsSalesmandatewise,
  assignShopsOnlydatewise,

  // 08-11-2022

  createtartget,
  get_user_target,
  getall_targets,
  getusertarget,
  // map view
  getAssign_bySalesman,
  // 26-11-2022
  overall_Count_And_Data,
  map1,
  map2,
  map3,
  assignData,
  re_getAssign_bySalesman,
  re_getAssign_bySalesman_final_customer
};
