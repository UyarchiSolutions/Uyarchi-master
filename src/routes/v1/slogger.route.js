const express = require('express');
const sloggerController = require('../../controllers/slogger.controller');
const router = express.Router();

router.route('/').post(sloggerController.createSlogger);
router
  .route('/:sloggerId')
  .get(sloggerController.getSloggerById)
  .delete(sloggerController.deleteSloggerById)
  .put(sloggerController.updateSlogger);

module.exports = router;
