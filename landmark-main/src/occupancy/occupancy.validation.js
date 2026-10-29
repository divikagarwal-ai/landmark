const Joi = require('joi');

exports.getInventorySchema = Joi.object({
  venue_uuid: Joi.string().guid().allow(null, ''),
  from_date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  to_date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});
exports.upsertInventorySchema = Joi.object({
  occupancy_uuid: Joi.string().allow(null, '').messages({
    'string.base': 'occupancy_uuid must be a string.',
    'any.required': 'occupancy_uuid is required.',
  }),
  venue_uuid: Joi.string().required().messages({
    'string.base': 'venue_uuid must be a string.',
    'any.required': 'venue_uuid is required.',
  }),
  venue_name: Joi.string().required().messages({
    'string.base': 'venue_name must be a string.',
    'any.required': 'venue_name is required.',
  }),
  venue_shift: Joi.number()
    .valid(1)
    .required()
    .description(
      "Shift timing of the venue. Allowed values are 1 for 'MORNING' and 2 for 'EVENING'.",
    ),
  venue_address: Joi.string().allow(null, '').messages({
    'string.base': 'venue_shift must be a string.',
  }),
  is_venue_available: Joi.boolean().required().messages({
    'boolean.base': 'is_venue_available must be a boolean.',
    'any.required': 'is_venue_available is required.',
  }),
  capacity: Joi.number().required(),
  price: Joi.number().required(),
  calendar_uuid: Joi.string().guid().max(50).required(),
  calendar_date: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});
exports.upsertBulkInventorySchema = Joi.object({
  occupancy_uuid: Joi.string().allow(null, '').messages({
    'string.base': 'occupancy_uuid must be a string.',
    'any.required': 'occupancy_uuid is required.',
  }),
  venue_uuid: Joi.string().required().messages({
    'string.base': 'venue_uuid must be a string.',
    'any.required': 'venue_uuid is required.',
  }),
  venue_name: Joi.string().required().messages({
    'string.base': 'venue_name must be a string.',
    'any.required': 'venue_name is required.',
  }),
  venue_shift: Joi.number()
    .valid(1)
    .required()
    .description(
      "Shift timing of the venue. Allowed values are 1 for 'MORNING' and 2 for 'EVENING'.",
    ),
  is_venue_available: Joi.boolean().required().messages({
    'boolean.base': 'is_venue_available must be a boolean.',
    'any.required': 'is_venue_available is required.',
  }),
  venue_address: Joi.string().allow(null, '').messages({
    'string.base': 'venue_shift must be a string.',
  }),
  capacity: Joi.number().required(),
  price: Joi.number().required(),
  from_date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  to_date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});
exports.bookingSchema = Joi.object({
  customer_fact_uuid: Joi.string().max(50).required().messages({
    'string.base': 'customer_fact_uuid must be a string.',
    'string.max': 'customer_fact_uuid cannot exceed 50 characters.',
  }),
  booking_uuid: Joi.string().guid().allow(null),
  from_date: Joi.string()
    // .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  to_date: Joi.string()
    // .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  event_time: Joi.string().allow(null),
  leads_uuid: Joi.string().allow(null).messages({
    'string.base': 'leads_uuid must be a string.',
  }),
  venue_uuid: Joi.string().max(50).required().messages({
    'string.base': 'venue_uuid must be a string.',
    'string.max': 'venue_uuid cannot exceed 50 characters.',
    'any.required': 'venue_uuid is required.',
  }),
  venue_name: Joi.string().max(50).required().messages({
    'string.base': 'venue_name must be a string.',
    'string.max': 'venue_name cannot exceed 50 characters.',
    'any.required': 'venue_name is required.',
  }),
  venue_shift: Joi.number()
    .valid(1)
    .required()
    .description(
      "Shift timing of the venue. Allowed values are 1 for 'MORNING' and 2 for 'EVENING'.",
    ),
  customer_name: Joi.string().allow(null).messages({
    'string.base': 'customer_name must be a string.',
  }),
  customer_email: Joi.string().email().allow(null).messages({
    'string.base': 'customer_email must be a valid string.',
    'string.email': 'customer_email must be a valid email address.',
  }),
  customer_mobile_no: Joi.string().allow(null).messages({
    'string.base': 'customer_mobile_no must be a string.',
  }),
  total_price: Joi.number().messages({
    'number.base': 'total_price must be a number.',
  }),
  total_nights: Joi.number().allow(null),
  total_guest: Joi.number().min(1),
  food_menu: Joi.array().items(Joi.object()).allow(null),
});

exports.getBookingSchema = Joi.object({
  venue_uuid: Joi.string().guid().max(50),
  customer_fact_uuid: Joi.string().guid().allow(null, ''),
  booking_uuid: Joi.string().guid().allow(null, ''),
  occupancy_uuid: Joi.string().guid().allow(null, ''),
  columns: Joi.array(),
  value: Joi.string(),
  status: Joi.string().valid('BOOKED', 'BOOKING_FAILED').optional(),
  from_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pageNo: Joi.number().integer().min(1).default(1),
  pageLimit: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('The maximum number of pages allowed.'),
  itemPerPage: Joi.number().integer().min(1).default(10),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});

exports.cancelBookingSchema = Joi.object({
  booking_uuid: Joi.string().guid().max(50).required(),
});
