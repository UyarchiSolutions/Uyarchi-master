const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const DemoService = require('../services/demoReg.service');


const createDemo = catchAsync(async (req, res) => {
    const data = await DemoService.createDemo(req.body)
    res.send(data)
})



const Fetch_All_Demo = catchAsync(async (req, res) => {
    const data = await DemoService.Fetch_All_Demo()
    res.send(data)
})



module.exports = {
    createDemo,
    Fetch_All_Demo
}