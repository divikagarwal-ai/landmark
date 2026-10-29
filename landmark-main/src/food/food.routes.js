const express = require('express');
const {
  upsertCategory,
  getCategory,
  upsertFoodMenu,
  getFood,
  upsertCategoryType,
  getCategoryType,
  addFoodMenu,
  getFoodMenu,
  addFoodMenuToLead,
} = require('./food.controller');
const checkAuth = require('../../middleware/checkAuth');
const Schema = require('./food.validation');

const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router.route('/upsert-food-menu').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.venueValidationSchema
    null,
    upsertFoodMenu,
  ),
);

router.route('/get-food-menu').get(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.getVenueValidationSchema
    null,
    getFoodMenu,
  ),
);

router.route('/added-lead-food-menu').post(
  checkAuth,
  requestErrorHandlingDecorator(
    // Schema.venueValidationSchema
    null,
    addFoodMenuToLead,
  ),
);

module.exports = router;
