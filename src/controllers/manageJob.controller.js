const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const manageJobService = require('../services/manageJob.service')



const createUserId = catchAsync(async (req, res) => {
    const user = await manageJobService.createUser(req.body);

    if (req.files) {
        let path = '';
        path = 'images/jobresume/';
        if (req.files.resume != null) {
            user.resume =
            path +
            req.files.resume.map((e) => {
              return e.filename;
            });
        }
        
        await user.save();
        res.status(httpStatus.CREATED).send(user);
      }
    // res.send(user);
  });

  const getdata = catchAsync(async (req,res)=>{
    const data = await manageJobService.getdata();
    res.send(data)
  });

  const createEnquiry = catchAsync(async (req, res) => {
    const user = await manageJobService.createEnquiry(req.body);
    res.send(user);
  });

  const getdataEqu = catchAsync(async (req,res)=>{
    const data = await manageJobService.getdataEqu();
    res.send(data)
});

module.exports = {
    createUserId,
    getdata,
    createEnquiry,
    getdataEqu,

}