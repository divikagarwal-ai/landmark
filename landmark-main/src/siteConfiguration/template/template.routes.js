const express = require('express');
const controller = require('./template.controller');
const checkAuth = require('../../middleware/checkAuth');
const generalController = require('../general/general.controller');
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router
  .route('/edit-template')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.createTemplates),
  );

router
  .route('/get-templates')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getTemplates));

router
  .route('/render-template')
  .post(requestErrorHandlingDecorator(null, controller.renderTemplate));

router
  .route('/get-sql-view-or-columns')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getTemplateDynamicView),
  );

router
  .route('/upsert-sql-view-or-columns')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.generateSqlView),
  );

router
  .route('/upsert-email-body-template-mapping')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.upsertEmailBodyByTemplateMapping,
    ),
  );

router
  .route('/get-email-body')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getTemplateDynamicView),
  );

router
  .route('/get-table-or-column-name')
  .get(
    requestErrorHandlingDecorator(null, controller.getTableNameOrColumnName),
  );

router
  .route('/get-whatsapp-exotel-template')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWhatsappExotelTemplate),
  );

router
  .route('/create-whatsapp-template')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.createWhatsappTemplate),
  );

module.exports = router;
