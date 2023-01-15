const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const pettyStockService = require('../services/b2b.pettyStock.service');
const httpStatus = require('http-status');


const pettyStockSubmit = catchAsync(async (req, res) => {
    const pettystock = await pettyStockService.pettyStockSubmit( req.body);
    res.send(pettystock);
  });


module.exports = {
    pettyStockSubmit,

}