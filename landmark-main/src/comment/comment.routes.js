const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./comment.controller');
const router = require('express').Router();
const Schema = require('./comment.validation');
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/upsert-comment')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.upsertCommentSchema,
      controller.upsertComment,
    ),
  );
router
  .route('/get-comment')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.getCommentSchema,
      controller.getComment,
    ),
  );

module.exports = router;
