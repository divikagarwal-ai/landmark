const express = require('express');
const { upsertVenue, getVenue } = require('./venue.controller');
const checkAuth = require('../../middleware/checkAuth');
const Schema = require('./venue.validation');

const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router.route('/upsert-venue').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.venueValidationSchema,
    null,
    upsertVenue,
  ),
);

router.route('/get-venue').get(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.getVenueValidationSchema
    null,
    getVenue,
  ),
);

module.exports = router;
