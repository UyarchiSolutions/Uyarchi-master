const express = require('express');
const metauserController = require('../../controllers/metaUSer.controller');

const router = express.Router();

router.route('/').post(metauserController.createMetaUSers);
router
  .route('/:id')
  .get(metauserController.getmetaUserById)
  .put(metauserController.updateMetauser)
  .delete(metauserController.deleteMetaUser);

module.exports = router;
