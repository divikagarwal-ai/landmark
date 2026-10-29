const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./user.controller');
const router = require('express').Router();
const Schema = require('./user.validation');
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/upsert-user')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.upsertUserSchema,
      controller.upsertUser,
    ),
  );

router.route('/update-profile').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.upsertUserProfileSchema,
    null,
    controller.upsertUserProfile,
  ),
);

router
  .route('/get-user')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getUser));

router
  .route('/upsert-branch')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.upsertBranchSchema,
      controller.upsertBranch,
    ),
  );

router
  .route('/get-branch')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getBranch));

router
  .route('/change-user-role')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.changeUserRole),
  );

router
  .route('/change-user-pwd')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.changePassword),
  );

module.exports = router;
