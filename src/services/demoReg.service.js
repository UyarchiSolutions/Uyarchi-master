const httpStatus = require('http-status');
const Demo = require('../models/demoReg.model');
const ApiError = require('../utils/ApiError');


const createDemo = async (body) => {
    const values = await Demo.create(body)
    return values
}


const Fetch_All_Demo = async () => {
    const values = await Demo.find()
    return values
}

module.exports = {
    createDemo,
    Fetch_All_Demo
}