const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');
const controller = require('./occupancy.controller');
const router = require('express').Router();
const checkAuth = require('../../middleware/checkAuth');
const Schema = require('./occupancy.validation');

router.route('/upsert-occupancy').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.upsertInventorySchema,
    null,
    controller.upsertOccupancy,
  ),
);

router.route('/upsert-bulk-occupancy').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.upsertBulkInventorySchema,
    null,
    controller.upsertBulkOccupancy,
  ),
);

router
  .route('/get-occupancy')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.getInventorySchema,
      controller.getOccupancy,
    ),
  );

router.route('/booking').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.bookingSchema,
    null,
    controller.Booking,
  ),
);
router.route('/cancel-booking').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.cancelBookingSchema,
    null,
    controller.cancelBooking,
  ),
);

router
  .route('/get-booking')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      Schema.getBookingSchema,
      controller.getBooking,
    ),
  );
router
  .route('/get-event-timing')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getEventTiming),
  );

module.exports = router;
