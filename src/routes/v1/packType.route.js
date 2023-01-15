const express = require('express');
const packTypeController = require('../../controllers/packType.controller');

const router = express.Router();

router.route('/').post(packTypeController.createpack);

router.route('/allData/:unit/:page').get(packTypeController.getallPack)
router.route('/:unit/:date/:Pid').get(packTypeController.getallPackUnit)
router.route('/getId/:id').get(packTypeController.getpackrById)
router
  .route('/:id')
  .delete(packTypeController.deletepack)
  .put(packTypeController.updatepackById);

module.exports = router;
