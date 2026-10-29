const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./history.controller');
const router = require('express').Router();
const Schema = require('./history.validation');
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/upsert-history')
  .post(
    requestErrorHandlingDecorator(
      Schema.postHistorySchema,
      controller.upsertHistory,
    ),
  );
router
  .route('/get-history')
  // .get(requestErrorHandlingDecorator(checkAuth, getHistorySchema, controller.getHistory));
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.getHistorySchema,
      controller.getHistory,
    ),
  );

router
  .route('/upsert-email-history')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.upsertEmailHistorySchema,
      controller.upsertEmailHistory,
    ),
  );
router
  .route('/get-email-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.getEmailHistorySchema,
      controller.getEmailHistory,
    ),
  );

module.exports = router;
