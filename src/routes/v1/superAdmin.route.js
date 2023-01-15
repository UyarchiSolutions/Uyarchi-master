const express = require('express');
const superAdminController = require('../../controllers/superAdmin.controller');
const superAdminProofs = require('../../middlewares/superAdminUpload');

const router = express.Router();

router
  .route('/')
  .post(
    superAdminProofs.fields([{ name: 'idProof' }, { name: 'addressProof' }, { name: 'bioData' }]),
    superAdminController.createSuperAdmin
  )
  .get(superAdminController.superAdminList);
router.route('/login').post(superAdminController.login);
router
  .route('/:superAdminId')
  .get(superAdminController.getSuperAdminById)
  .put(
    superAdminProofs.fields([{ name: 'idProof' }, { name: 'addressProof' }, { name: 'bioData' }]),
    superAdminController.updateSuperAdminById
  );
module.exports = router;
