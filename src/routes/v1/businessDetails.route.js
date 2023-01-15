const express = require('express');
const BusinessController = require('../../controllers/businessDetails.controller');
const router = express.Router();

router.route('/').post(BusinessController.createBusiness).get(BusinessController.getBusinessDetails);

router
  .route('/:businessId')
  .get(BusinessController.getbusinessDetailsbyId)
  .put(BusinessController.updateBusiness)
  .delete(BusinessController.deletBusiness);

module.exports = router;
