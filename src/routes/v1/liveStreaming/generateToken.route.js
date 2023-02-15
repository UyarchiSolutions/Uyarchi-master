const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/auth.controller');
const auth = require('../../../middlewares/auth');
const supplierAuth = require('../../../controllers/supplier.authorizations');
const shopverify = require('../../../controllers/shoptokenverify.controller');
const subhostVerify = require('../../../controllers/subhostVefify.controller');

const router = express.Router();
const generateToken = require('../../../controllers/liveStreaming/generateToken.controller');

router.route('/getToken').post(supplierAuth, generateToken.generateToken);
router.get('/getHostTokens', generateToken.getHostTokens);
router.get('/gettoken/byId', generateToken.gettokenById);
router.get('/gettoken/host/byId', generateToken.gettokenById_host);
router.get('/getparticipents/limit', generateToken.participents_limit);
router.put('/leave/participents/limit', generateToken.leave_participents);
router.get('/leave/host', generateToken.leave_host);
router.get('/join/host/admin', generateToken.join_host);
router.post('/recording/acquire', generateToken.agora_acquire);
router.post('/recording/start', generateToken.recording_start);
router.post('/recording/query', generateToken.recording_query);
router.post('/recording/stop', generateToken.recording_stop);
router.post('/recording/updateLayout', generateToken.recording_updateLayout);
router.post('/chat/room/details', generateToken.chat_rooms);
router.route('/getsub/token/user').get(shopverify, generateToken.get_sub_token);
router.route('/getsub/token/golive').get(shopverify, generateToken.get_sub_golive);


router.route('/getsub/token/single').get(shopverify, generateToken.get_sub_token_single);
router.route('/participents/limit/all').get(generateToken.get_participents_limit);


router.route('/remove/hostlive/now').get(generateToken.remove_host_live);

router.route('/create/subhost/token').post(subhostVerify, generateToken.create_subhost_token);


module.exports = router;
