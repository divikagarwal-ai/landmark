const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const checkAuth = require('../../middleware/checkAuth');
const router = require('express').Router();
const controller = require('./workflow.controller');

router
  .route('/upsert-workflow-basic')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertWorkflowBasic),
  );

router
  .route('/get-workflow-basic')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWorkflowBasic),
  );

router
  .route('/upsert-workflow-condition')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertWorkflowCondition),
  );

router
  .route('/get-workflow-condition')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWorkflowCondition),
  );

router
  .route('/upsert-workflow-action')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertWorkflowAction),
  );

router
  .route('/get-workflow-action')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWorkflowAction),
  );

router
  .route('/upsert-workflow-action-email')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertWorkflowActionEmail),
  );

router
  .route('/get-workflow-action-email')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWorkflowActionEmail),
  );

router
  .route('/upsert-workflow-action-message')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertWorkflowActionMessage),
  );

router
  .route('/get-workflow-action-message')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWorkflowActionMessage),
  );

router
  .route('/get-workflow-all-definition')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAllWorkflowDefinition),
  );

/**
 * @swagger
 * /api/v1/workflow/workflow-initiate:
 *   post:
 *     tags: [Work Flow]
 *     summary: Work Flow Initiate.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint_path:
 *                 type: string
 *                 default: ""
 *               upsert_type:
 *                 type: string
 *                 default: "CREATE | UPDATE"
 *               identifier:
 *                 type: object
 *                 properties:
 *                   column_name:
 *                     type: string
 *                     default: ""
 *                   column_value:
 *                     type: string
 *                     default: ""
 *               changed_column:
 *                 type: object
 *                 properties:
 *                   column1:
 *                     type: object
 *                     properties:
 *                       old_value:
 *                         type: string
 *                         default: ""
 *                       new_value:
 *                         type: string
 *                         default: ""
 *               no_changed_column:
 *                 type: object
 *                 properties:
 *                   column1:
 *                     type: string
 *                     default: ""
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/workflow-initiate')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.workflowInitiate),
  );

module.exports = router;
