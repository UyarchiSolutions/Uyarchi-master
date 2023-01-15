const express = require('express');
const streetController = require('../../controllers/street.controller');
const router = express.Router();
router.route('/').post(streetController.createStreet).get(streetController.getAllStreet);

router
  .route('/:streetId')
  .get(streetController.getStreetDetailsById)
  .put(streetController.updateStreet)
  .delete(streetController.deleteStreet);

router.route('/updates/new').get(streetController.updates);
router.route('/streets/:AllocatedUser').get(streetController.getaggregationByUserId);
router.route('/streets/DeAllocatedUser/:AllocatedUser').get(streetController.getDeAllocationaggregationByUserId);
router.route('/streetByWard/:wardId').get(streetController.getStreetByWardId);
router.route('/street/Ward/:wardId/:status').get(streetController.getStreetByWard);
router.route('/page/:key/:id').get(streetController.streetPagination);
router.route('/street/Allocation').post(streetController.streetAllocation).get(streetController.getAllocatedStreeOnly);
router
  .route('/street/deAllocation')
  .post(streetController.streetDeAllocation)
  .get(streetController.getAllDeAllocatedStreetOnly);
router.route('/closedStatus/:streetId').put(streetController.closedStatus);
router.route('/:id/order/street').get(streetController.streetorder);
router.route('/getall/wardid/:wardId').get(streetController.getStreetByWardId);
router.route('/Search/Api/:key').get(streetController.areaSearchApi);

router.route('/getDummy/streets').get(streetController.getDummyStreet);
router.route('/getward/ward/:wardId').get(streetController.getStreetWard);
router.route('/renameStreet').post(streetController.renameStreet);
router.route('/getstreet/By/ward/:wardId').get(streetController.getwardBystreetAngular);
router.route('/Street/:wardId').get(streetController.getAllUnAssignedStreetandCount);
router.route('/getTelecallerAllUnAssignedStreetandCount/:wardId').get(streetController.getTelecallerAllUnAssignedStreetandCount);
router.route('/getSalesmanAllUnAssignedStreetandCount/:wardId').get(streetController.getSalesmanAllUnAssignedStreetandCount);
module.exports = router;
