const express = require('express');
const {
  handleGoogleReviewWebhook,
  getGoogleReviews,
  getReviewSuggestion,
  getReviewAnalytics,
  analyzeReview,
  fetchTripAdvisorReviews,
  getReviewAnalysis,
} = require('./review.controller');
const checkAuth = require('../../middleware/checkAuth');

const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router
  .route('/google-reviews')
  .get(checkAuth, requestErrorHandlingDecorator(null, getGoogleReviews));

router
  .route('/google-reviews/webhook')
  .post(requestErrorHandlingDecorator(null, handleGoogleReviewWebhook));

router
  .route('/review-suggestion')
  .get(checkAuth, requestErrorHandlingDecorator(null, getReviewSuggestion)),
  router
    .route('/review-analytics')
    .get(checkAuth, requestErrorHandlingDecorator(null, getReviewAnalytics));

router
  .route('/analyze-review')
  .post(requestErrorHandlingDecorator(null, analyzeReview));


router
  .route('/review-analysis')
  .get(checkAuth, requestErrorHandlingDecorator(null, getReviewAnalysis));

router
  .route('/tripadvisor-reviews')
  .get(requestErrorHandlingDecorator(null, fetchTripAdvisorReviews));

module.exports = router;
