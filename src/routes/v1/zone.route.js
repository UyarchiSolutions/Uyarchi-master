const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const zoneController = require('../../controllers/zone.controller');
const router = express.Router();
router.route('/import').get(zoneController.getZones);
router.route('/').post(zoneController.createZone).get(zoneController.getAllZones);

router
  .route('/:zoneId')
  .get(zoneController.getZoneDetailsById)
  .put(zoneController.updateZone)
  .delete(zoneController.deleteZone);

router.route('/zoneByDistrict/:districtId').get(zoneController.getZoneByDistrict);
router.route('/page/:id').get(zoneController.zonePagination);
router.route('/counts/street').get(zoneController.getCounts_Street);

module.exports = router;
