const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const checkOut = require("../services/checkout.service");



const add_to_cart = catchAsync(async (req, res) => {
    const category = await checkOut.add_to_cart(req.shopId, req.body);
    res.send(category);
});


const verifycheckout = catchAsync(async (req, res) => {
    const category = await checkOut.verifycheckout(req.shopId);
    res.send(category);
});

const getcartProduct = catchAsync(async (req, res) => {
    const category = await checkOut.getcartProduct(req.shopId);
    res.send(category);
});

const confirmOrder_razerpay = catchAsync(async (req, res) => {
    const category = await checkOut.confirmOrder_razerpay(req.shopId, req.body);
    res.send(category);
});
const confirmOrder_cod = catchAsync(async (req, res) => {
    const category = await checkOut.confirmOrder_cod(req.shopId, req.body);
    res.send(category);
});




const getshoporder_byID = catchAsync(async (req, res) => {
    const check = await checkOut.getshoporder_byID(req.shopId, req.query);
    res.send(check);
});






module.exports = {
    verifycheckout,
    add_to_cart,
    getcartProduct,
    confirmOrder_razerpay,
    getshoporder_byID,
    confirmOrder_cod
}