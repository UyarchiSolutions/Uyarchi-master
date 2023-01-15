const express = require('express');
const scvController = require('../../controllers/scv.controller');

const router = express.Router();
router.route('/').post(scvController.createSCV).get(scvController.gertAllSCV);

router.route('/:scvId').get(scvController.getSCVById).put(scvController.updateSCV).delete(scvController.deletescv);

module.exports = router;
