const express = require('express');
const controller = require('./customer.controller');
const checkAuth = require('../../middleware/checkAuth');
// const { isAdmin } = require("../middlewares/checkRole");
// const { expressValidatorMiddleware } = require("../middlewares/expressValidator.middleware");
// const generalController = require('../controllers/general.controller')
//  const { errorCodeMsg } = require("../../utils/validationCodeMsg");
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const Schema = require('./customer.validation');

const router = express.Router();

router
  .route('/upsert-customer')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertCustomer),
  );

router
  .route('/get-customer')
  .get(checkAuth, requestErrorHandlingDecorator(null, controller.getCustomer));
router
  .route('/get-customer-personal-details')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getCustomerPersonalDetails),
  );

router
  .route('/insert-transaction')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.insertTransaction),
  );
router
  .route('/get-transaction')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getTransaction),
  );
router
  .route('/transaction-receipt')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getTransactionReceipt),
  );
router
  .route('/upsert-package-structure')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.upsertPackageStructure),
  );

router.route('/edit-customer-prospact-details').post(
  //[
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("customer_name", errorCodeMsg('customer name', 'exist')).exists(),
  //     body("customer_name", errorCodeMsg('customer name', 'filled')).not().isIn('').not().isIn('string'),
  //     body("customer_code", errorCodeMsg('customer code', 'exist')).exists(),
  //     body("customer_code", errorCodeMsg('customer code', 'filled')).not().isIn('').not().isIn('string'),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(null, controller.editCustomerProspectDetails),
);

router
  .route('/get-customer-prospact-details')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getCustomerProspectDetails),
  );

router.route('/edit-customer-social').post(
  // [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(null, controller.editCustomerSocial),
);

router
  .route('/get-customer-social')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getCustomerSocial),
  );

router
  .route('/edit-customer-related-account')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(controller.editCustomerRelatedAccount),
  );

router
  .route('/get-customer-related-account')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getCustomerRelatedAccount),
  );

router.route('/edit-customer-consent').post(
  //     [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(controller.editCustomerConsent),
);

/**
 * @swagger
 * /api/v1/customer/get-customer-consent:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all customer consent as well as single by customer consent.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name:   customer_id
 *       schema:
 *         type: number
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-consent')
  .get(checkAuth, requestErrorHandlingDecorator(controller.getCustomerConsent));

/**
 * @swagger
 * /api/v1/customer/edit-customer-activity:
 *   post:
 *     tags: [Customer]
 *     summary: Create customer activity.
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
 *               customer_id:
 *                 type: number
 *               incremental_number:
 *                 type: number
 *               activity:
 *                 type: string
 *                 default: null
 *               start_date:
 *                 type: string
 *                 default: null
 *               completed_date:
 *                 type: string
 *                 default: null
 *               due_date:
 *                 type: string
 *                 default: null
 *               file_upload:
 *                 type: string
 *                 default: null
 *               assigned_to_id:
 *                 type: string
 *                 default: null
 *               created_by_id:
 *                 type: string
 *                 default: null
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router.route('/edit-customer-activity').post(
  //     [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(controller.editCustomerActivity),
);

/**
 * @swagger
 * /api/v1/customer/get-customer-activity:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all customer activity as well as single by customer activity.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name:   customer_id
 *       schema:
 *         type: number
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-activity')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getCustomerActivity),
  );

/**
 * @swagger
 * /api/v1/customer/get-customer-all-detailed-record:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all customer all detailed records as well as single by customer all detailed record.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name:   customer_id
 *       schema:
 *         type: number
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     - in: query
 *       name: advanceFilter
 *       schema:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             column:
 *               type: array
 *               items:
 *                 type: string
 *                 default: ""
 *             operator:
 *               type: string
 *               default: "EQUAL | NOT_EQUAL | GREATER  | LESSER | GREATER_THAN_EQUAL | LESSER_THAN_EQUAL | CONTAINS | STARTS_WITH | ENDS_WITH | DATE_RANGE"
 *             value:
 *               type: string
 *               default: ""
 *             logicalOperator:
 *               type: string
 *               default: "AND | OR"
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-all-detailed-record')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getCustomerAllDetailedRecord),
  );

/**
 * @swagger
 * /api/v1/customer/get-comment:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all comment.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: type_id
 *       schema:
 *         type: string
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-comment')
  .get(checkAuth, requestErrorHandlingDecorator(controller.getComment));

/**
 * @swagger
 * /api/v1/customer/edit-customer-group:
 *   post:
 *     tags: [Customer]
 *     summary: Create customer group.
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
 *               customer_id:
 *                 type: number
 *               group_number:
 *                 type: number
 *                 default: null
 *               group_name:
 *                 type: string
 *                 default: null
 *               group_code:
 *                 type: string
 *                 default: null
 *               occupation:
 *                 type: string
 *                 default: null
 *               employer:
 *                 type: string
 *                 default: null
 *               membership_number:
 *                 type: string
 *                 default: null
 *               supervisor:
 *                 type: string
 *                 default: null
 *               phone:
 *                 type: string
 *                 default: null
 *               description:
 *                 type: string
 *                 default: null
 *               assigned_to:
 *                 type: string
 *                 default: null
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router.route('/edit-customer-group').post(
  //     [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("phone", errorCodeMsg('phone', '10 digits')).isLength({min: 10, max: 10 }).optional({checkFalsy: true}),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(controller.editCustomerGroup),
);

/**
 * @swagger
 * /api/v1/customer/get-customer-group:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all customer groups as well as single by customer group.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_id
 *       schema:
 *         type: string
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-group')
  .get(checkAuth, requestErrorHandlingDecorator(controller.getCustomerGroup));

/**
 * @swagger
 * /api/v1/customer/create-secondary-contact:
 *   post:
 *     tags: [Customer]
 *     summary: Create secondary contact.
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
 *               customer_id:
 *                 type: number
 *               incremental_number:
 *                 type: number
 *               salutation:
 *                 type: string
 *                 default: null
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *                 default: null
 *               phone:
 *                 type: string
 *                 default: null
 *               phone_ext:
 *                 type: string
 *                 default: null
 *               type:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *                 default: null
 *               position:
 *                 type: string
 *                 default: null
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router.route('/create-secondary-contact').post(
  //     [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("first_name", errorCodeMsg('first name', 'exist')).exists(),
  //     body("first_name", errorCodeMsg('first name', 'filled')).not().isIn('').not().isIn('string'),
  //     body("email", errorCodeMsg('email', 'exist')).exists(),
  //     body("email", errorCodeMsg('email', 'filled')).not().isIn('').not().isIn('string'),
  //     body("email", errorCodeMsg('email', 0)).isEmail(),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(controller.createSecondaryContacts),
);

/**
 * @swagger
 * /api/v1/customer/get-secondary-contact:
 *   get:
 *     tags: [Customer]
 *     summary: It will show all customer groups as well as single by customer group.
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_id
 *       schema:
 *         type: string
 *     - in: query
 *       name: status
 *       schema:
 *         type: string
 *       description: Status for lead would be ACTIVE or INACTIVE.
 *     - in: query
 *       name: to_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: from_date
 *       schema:
 *         type: string
 *       description: Format will be YYYY-MM-DD.
 *     - in: query
 *       name: column
 *       schema:
 *         type: array
 *         items:
 *           type: string
 *           default: ""
 *       description: Column name for search value.
 *     - in: query
 *       name: value
 *       schema:
 *         type: string
 *       description: Search by
 *     - in: query
 *       name: pageNo
 *       schema:
 *         type: number
 *     - in: query
 *       name: itemPerPage
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-secondary-contact')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getSecondaryContacts),
  );

/**
 * @swagger
 * /api/v1/customer/update-secondary-contact:
 *   put:
 *     tags: [Customer]
 *     summary: Update secondary contact.
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
 *               customer_id:
 *                 type: number
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *                 default: null
 *               phone_b:
 *                 type: string
 *                 default: null
 *               phone_ext:
 *                 type: string
 *                 default: null
 *               job_title:
 *                 type: string
 *                 default: null
 *               type:
 *                 type: string
 *               phone_r:
 *                 type: string
 *                 default: null
 *               email:
 *                 type: string
 *               email_status:
 *                 type: string
 *                 default: null
 *               mobile:
 *                 type: string
 *                 default: null
 *               customer_name:
 *                 type: string
 *                 default: null
 *               address:
 *                 type: string
 *                 default: null
 *               other_address:
 *                 type: string
 *                 default: null
 *               unit_or_suite:
 *                 type: string
 *                 default: null
 *               city:
 *                 type: string
 *                 default: null
 *               province_or_state:
 *                 type: string
 *                 default: null
 *               postal_code:
 *                 type: string
 *                 default: null
 *               country:
 *                 type: string
 *                 default: null
 *               description:
 *                 type: string
 *                 default: null
 *               fax:
 *                 type: string
 *                 default: null
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router.route('/update-secondary-contact').put(
  //     [
  //     body("customer_id", errorCodeMsg('customer id', 'exist')).exists(),
  //     body("customer_id", errorCodeMsg('customer id', 'filled')).not().isIn('0'),
  //     body("customer_id", errorCodeMsg('customer id', 'number')).isNumeric(),
  //     body("first_name", errorCodeMsg('first name', 'exist')).exists(),
  //     body("first_name", errorCodeMsg('first name', 'filled')).not().isIn('').not().isIn('string'),
  //     body("email", errorCodeMsg('email', 'exist')).exists(),
  //     body("email", errorCodeMsg('email', 'filled')).not().isIn('').not().isIn('string'),
  //     body("email", errorCodeMsg('email', 0)).isEmail(),
  //     body("status", errorCodeMsg('status', 'exist')).exists(),
  //     body("status", errorCodeMsg('status', 'filled')).not().isIn(''),
  //     body("status", errorCodeMsg('status', 'capital letters')).matches(/^[A-Z]+$/),
  //     body("status", errorCodeMsg('status', 'ACTIVE or INACTIVE')).isIn(["ACTIVE", "INACTIVE"])
  // ],
  checkAuth,
  requestErrorHandlingDecorator(controller.updateSecondaryContacts),
);

/**
 * @swagger
 * /api/v1/customer/send-message-to-customer:
 *   post:
 *     tags: [Customer]
 *     summary: Send whatsapp, calls and sms.
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
 *               type:
 *                 type: string
 *               recipients:
 *                 default: [
 *                              {
 *                                  to: string,
 *                                  name: string
 *                              }
 *                          ]
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/send-message-to-customer')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(controller.sendMessageToCustomer),
  );

// <-----------------------------------------security APIs---------------------------------------------->

/**
 * @swagger
 * /api/v1/customer/get-customer-information-security:
 *   get:
 *     tags: [Customer]
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_policy_id
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-information-security')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      controller.getCustomerPersonalInformationSecurity,
    ),
  );

/**
 * @swagger
 * /api/v1/customer/get-customer-prospect-details-security:
 *   get:
 *     tags: [Customer]
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_policy_id
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-prospect-details-security')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      controller.getCustomerProspectDetailsSecurity,
    ),
  );

/**
 * @swagger
 * /api/v1/customer/get-customer-social-security:
 *   get:
 *     tags: [Customer]
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_policy_id
 *       schema:
 *         type: number\
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-social-security')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getCustomerSocialSecurity),
  );

/**
 * @swagger
 * /api/v1/customer/get-customer-related-account-security:
 *   get:
 *     tags: [Customer]
 *     parameters:
 *     - in: header
 *       name: auth-Token
 *       schema:
 *         type: string
 *         required: true
 *     - in: query
 *       name: customer_policy_id
 *       schema:
 *         type: number
 *     responses:
 *       200:
 *          description: OK
 *       400:
 *          description: Bad Request
 */
router
  .route('/get-customer-related-account-security')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(controller.getCustomerRelatedAccountSecurity),
  );

module.exports = router;
