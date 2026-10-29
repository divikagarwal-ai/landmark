const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./dataManagement.controller');
const router = require('express').Router();
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/upsert-branch')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertBranch),
  );

router
  .route('/get-branch')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getBranch));

router
  .route('/upsert-zone')
  .post(checkAuth, requestErrorHandlingDecorator(null, controller.upsertZone));

router
  .route('/get-zone')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getZone));

module.exports = router;
