const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./analytics.controller');
const router = require('express').Router();
const Schema = require('./analytics.validation');
const checkAuth = require('../../middleware/checkAuth');

router.route('/lead-followups').get(
  checkAuth,
  requestErrorHandlingDecorator(
    //   Schema.insertApprovalSchema,
    null,
    controller.leadFollowupsAnalytics,
  ),
);

router
  .route('/leads')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.leadAnalytics),
  );

router
  .route('/ongoing-leads')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.ongoingLeadAnalytics),
  );

router
  .route('/review-keyword-count')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.reviewKeywordCountAnalytics),
  );

module.exports = router;
