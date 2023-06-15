const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const randomStockService = require('../services/randomStock.service');
const httpStatus = require('http-status');


const getProductName= catchAsync(async (req, res) => {
    const amount = await randomStockService.getProduct();
    res.send(amount);
  });

  const createrandomStock = catchAsync(async (req, res) => {
    const stock = await randomStockService.createrandomStock(req.body);
    // //console.log(wallet);
    if (req.files) {
      let path = '';
      path = 'images/randomStock/';
      if (req.files.wastedImageFile != null) {
        stock.wastedImageFile =
          path +
          req.files.wastedImageFile.map((e) => {
            return e.filename;
          });
      }
      
      await stock.save();
      res.status(httpStatus.CREATED).send(stock);
    }
  });

  const getAll = catchAsync(async (req, res) => {
    const getDAte = await randomStockService.getAll(
      req.params.product,
      req.params.date
      );
    res.send(getDAte);
  });
  const getProductNameDetails = catchAsync(async (req, res) => {
    const getDAte = await randomStockService.getProductNameDetails();
    res.send(getDAte);
  });


module.exports = {
    getProductName,
    createrandomStock,
    getAll,
    getProductNameDetails,
}