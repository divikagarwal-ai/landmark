const express = require('express');
const checkAuth = require('../../middleware/checkAuth');
// const Schema = require('./lead.validation');

const {
  upsertCompanyInformation,
  getCompanyInformation,
  getPublicCompanyInformation,
  getEnvironmentConfiguration,
  upsertEnvironmentConfiguration,
} = require('./siteConfiguration.controller');

const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();
router
  .route('/upsert-site-configuration')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, upsertCompanyInformation),
  );
router
  .route('/get-site-configuration')
  .get(checkAuth, requestErrorHandlingDecorator(null, getCompanyInformation));
router
  .route('/get-public-site-configuration')
  .get(requestErrorHandlingDecorator(null, getPublicCompanyInformation));

router
  .route('/upsert-environment-configuration')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, upsertEnvironmentConfiguration),
  );

router
  .route('/get-environment-configuration')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, getEnvironmentConfiguration),
  );
module.exports = router;
