const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const userFineService = require('../services/user_Fine.service');



const createUserFine = catchAsync(async(req, res)=> {
    const data = await userFineService.createUserFine(req.body)
    res.send(data)
})


module.exports = {
    createUserFine
}