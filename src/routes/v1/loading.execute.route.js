const express = require('express');
const loadingExecuteController = require('../../controllers/loading.execute.controller');
const router = express.Router();

router.route('/').post(loadingExecuteController.createloadingExecute).get(loadingExecuteController.getAllLoadingExecute);
router
  .route('/:loadingExecuteId')
  .get(loadingExecuteController.getloadingExecuteById)
  .delete(loadingExecuteController.deleteloadingExecuteById)
  .put(loadingExecuteController.updateloadingExecuteById);

module.exports = router;
