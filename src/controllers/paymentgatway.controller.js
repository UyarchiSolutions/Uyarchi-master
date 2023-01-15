const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const paymentgatway = require('../services/paymentgatway.service');


const razorpayOrderId = catchAsync(async (req, res) => {
    const postorder = await paymentgatway.razorpayOrderId(req.body);
    res.send(postorder);
});



const getallrazorpaypayment = catchAsync(async (req, res) => {
    const postorder = await paymentgatway.getallrazorpaypayment(req.body);
    res.send(postorder);
});


module.exports = { razorpayOrderId, getallrazorpaypayment };
