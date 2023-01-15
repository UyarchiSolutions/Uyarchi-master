const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const wardAdminRoleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  startingValue: {
    type: Number,
  },
  startingTonne: {
    type: Number,
  },
  type: {
    type: String,
  },
  unit: {
    type: String,
  },
  Asm: {
    type: String,
  },
  userRoleId: {
    type: String,
  },
  b2bUserId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WardAdminRole = mongoose.model('wardAdminRole', wardAdminRoleSchema);
const wardAdminRoleAsmSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  salesman: {
    type: String,
  },
  wardAdminId: {
    type: String,
  },
  userRoleId: {
    type: String,
  },
  b2bUserId: {
    type: String,
  },
  unit: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WardAdminRoleAsm = mongoose.model('wardAdminRoleAsm', wardAdminRoleAsmSchema);

const AsmSalesManSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  asmId: {
    type: String,
  },
  salesManId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  reAssignDate: {
    type: String,
  },
  reAssignTime: {
    type: String,
  },
  status: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const AsmSalesMan = mongoose.model('AsmSalesMan', AsmSalesManSchema);
const SalesManShopSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  salesManId: {
    type: String,
  },
  fromSalesManId: {
    type: String,
  },
  shopId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  reAssignDate: {
    type: String,
  },
  reAssignTime: {
    type: String,
  },
  status: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: String,
  },
  createdTime: {
    type: Number
  }
});

const SalesManShop = mongoose.model('SalesManShop', SalesManShopSchema);

const withoutAsmSalesmanSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  unit: {
    type: String,
  },
  salesman: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WithoutAsmSalesman = mongoose.model('withoutAsmSalesman', withoutAsmSalesmanSchema);
const WardAdminRoleAsmHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  type: {
    type: String,
  },
  unit: {
    type: String,
  },
  wardAdminId: {
    type: String,
  },
  b2bUserId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WardAdminRoleAsmHistory = mongoose.model('WardAdminRoleAsmHistory', WardAdminRoleAsmHistorySchema);
const wardAdminRoleHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  b2bUserId: {
    type: String,
  },
  type: {
    type: String,
  },
  unit: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WardAdminRoleHistory = mongoose.model('wardAdminRoleHistory', wardAdminRoleHistorySchema);
const withoutAsmWithAsmSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  targetValue: {
    type: Number,
  },
  targetTonne: {
    type: Number,
  },
  unit: {
    type: String,
  },
  type: {
    type: String,
  },
  salesman: {
    type: String,
  },
  wardAdminId: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const WithoutAsmWithAsm = mongoose.model('withoutAsmWithAsm', withoutAsmWithAsmSchema);


const tartget = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Uid: {
    type: String,
  },
  teamtype: {
    type: String,
  },
  targetKg: {
    type: Number,
  },
  targetvalue: {
    type: Number,
  },
  b2buser: {
    type: String,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const Tartgetvalue = mongoose.model('targetValue', tartget);


const Tartget_History = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Uid: {
    type: String,
  },
  teamtype: {
    type: String,
  },
  targetKg: {
    type: Number,
  },
  targetvalue: {
    type: Number,
  },
  targetid: {
    type: String,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const TartgetHistory = mongoose.model('targethistory', Tartget_History);

module.exports = { WardAdminRole, WardAdminRoleAsm, AsmSalesMan, SalesManShop, WithoutAsmSalesman, WardAdminRoleAsmHistory, WardAdminRoleHistory, WithoutAsmWithAsm, Tartgetvalue, TartgetHistory };