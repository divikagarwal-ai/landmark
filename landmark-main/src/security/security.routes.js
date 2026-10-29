const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./security.controller');
const router = require('express').Router();
const Schema = require('./security.validation');
const checkAuth = require('../../middleware/checkAuth');

router
  .route('/upsert-roles')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.upsertRoleSchema,
      controller.upsertRoles,
    ),
  );
router
  .route('/get-roles')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(Schema.getRoleSchema, controller.getRoles),
  );

router.route('/upsert-role-module-content-access-permission').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.upsertSecurityRoleModuleSchema,
    null,
    controller.upsertRoleModuleContentAccessPermission,
  ),
);

router.route('/get-role-module-content-access-permission').get(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.getModuleListSchema,
    null,
    controller.getRoleModuleContentAccessPermission,
  ),
);

router
  .route('/get-modules')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getModules));

router
  .route('/upsert-role-group')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertRoleGroups),
  );
router
  .route('/get-role-group')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getRoleGroups),
  );

module.exports = router;
