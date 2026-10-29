const checkAuth = require('../../middleware/checkAuth');
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./authentication.controller');
const Schema = require('./authentication.validation');
const router = require('express').Router();

router
  .route('/user-verification')
  .post(
    requestErrorHandlingDecorator(
      Schema.userVerification,
      controller.userVerification,
    ),
  );

router
  .route('/login')
  .post(requestErrorHandlingDecorator(Schema.userLogin, controller.loginUser));

router
  .route('/validate-otp-get-token')
  .post(
    requestErrorHandlingDecorator(
      Schema.validateOtpGetToken,
      controller.validateOtpGetToken,
    ),
  );

router
  .route('/forget-password')
  .post(
    requestErrorHandlingDecorator(
      Schema.forgetPassword,
      controller.forgetPassword,
    ),
  );
router
  .route('/login-as-other-user')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.loginAsOtherUser),
  );

router
  .route('/logout')
  .put(requestErrorHandlingDecorator(Schema.userLogout, controller.logout));

router
  .route('/generate-otp')
  .post(requestErrorHandlingDecorator(null, controller.generateOtp));

module.exports = router;
