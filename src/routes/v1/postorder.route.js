const express = require('express');
const postController = require('../../controllers/postorder.controller');
const router = express.Router();

router.route('/').post(postController.createpostorder).get(postController.getallPostOrder);

router.route('/:id').get(postController.getPostOrderById).put(postController.updatePostorderById);
module.exports = router;
