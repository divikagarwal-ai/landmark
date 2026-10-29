const express = require('express');
const router = express.Router();
const controller = require('./campaign.controller');
const checkAuth = require('../../middleware/checkAuth');
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

router
  .route('/upsert-campaign')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertCampaign),
  );

router
  .route('/get-campaigns')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getCampaigns));

router.route('/run-campaigns').get(
  // checkAuth,
  requestErrorHandlingDecorator(null, controller.runCampaigns),
);

module.exports = router;
