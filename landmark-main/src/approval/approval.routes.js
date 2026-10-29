const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./approval.controller');
const router = require('express').Router();
const Schema = require('./approval.validation');
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/handle-approval')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.handleApprovalSchema,
      controller.handleApproval,
    ),
  );
router
  .route('/insert-approval')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.insertApprovalSchema,
      controller.insertApproval,
    ),
  );
router
  .route('/get-approval')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getApprovals));
router
  .route('/insert-approval-count')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.insertApprovalCountSchema,
      controller.insertApprovalCount,
    ),
  );
router
  .route('/get-approval-count')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getApprovalCount),
  );
router
  .route('/merge-approval-record')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.mergeApprovalWithRecord),
  );
module.exports = router;
