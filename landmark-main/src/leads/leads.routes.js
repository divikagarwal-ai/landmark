const express = require('express');
const {
  createLead,
  getLead,
  upsertOpportunity,
  getOpportunity,
  createAuthLead,
  getStatusLead,
  getGoogleBusinessReviews,
  handleGoogleReviewWebhook,
  getGoogleReviews,
  getReviewSuggestion,
  getReviewAnalytics,
} = require('./leads.controller');
const checkAuth = require('../../middleware/checkAuth');
const Schema = require('./leads.validation');

const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router.route('/auth-upsert-leads').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.leadValidationSchema
    null,
    createAuthLead,
  ),
);

router.route('/get-leads').get(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.getLeadSchema
    null,
    getLead,
  ),
);

router
  .route('/get-status-leads')
  .get(checkAuth, requestErrorHandlingDecorator(null, getStatusLead));

module.exports = router;
