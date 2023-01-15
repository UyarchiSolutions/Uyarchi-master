const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const TelecallerteamSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    telecallerHeadId: {
        type: String,
      },
    telecallerteamId: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    reAssignDate:{
      type:String,
    },
    reAssignTime:{
      type:String,
    },
    status:{
      type:String,
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
  
  const Telecallerteam = mongoose.model('Telecallerteam', TelecallerteamSchema);
  const TelecallerShopSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    telecallerteamId: {
      type: String,
    },
    fromtelecallerteamId:{
      type:String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    reAssignDate:{
      type:String,
    },
    reAssignTime:{
      type:String,
    },
    status:{
      type:String,
    },
    shopId:{
      type:String,
    },
    created: {
      type: String,
    },
    createdTime: {
      type: Number
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
  
  const TelecallerShop = mongoose.model('TelecallerShop', TelecallerShopSchema);

  // salesmanOrder
  const SalesmanOrderSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    salesmanOrderheadId: {
        type: String,
      },
    salesmanOrderteamId: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    reAssignDate:{
      type:String,
    },
    reAssignTime:{
      type:String,
    },
    status:{
      type:String,
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
  
  const SalesmanOrder = mongoose.model('SalesmanOrder', SalesmanOrderSchema);
  const SalesmanOrderShopSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: v4,
    },
    salesmanOrderteamId: {
      type: String,
    },
    fromsalesmanOrderteamId:{
      type:String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    reAssignDate:{
      type:String,
    },
    reAssignTime:{
      type:String,
    },
    status:{
      type:String,
    },
    shopId:{
      type:String,
    },
    created: {
      type: String,
    },
    createdTime: {
      type: Number
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
  
  const SalesmanOrderShop = mongoose.model('SalesmanOrderShop', SalesmanOrderShopSchema);
  module.exports = {Telecallerteam, TelecallerShop, SalesmanOrder, SalesmanOrderShop };