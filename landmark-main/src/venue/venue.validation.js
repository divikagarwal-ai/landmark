const Joi = require('joi');

exports.venueValidationSchema = Joi.object({
  venue_uuid: Joi.string()
    .guid()
    .allow(null)
    .description('Unique identifier for the venue (required for updates).'),
  venue_name: Joi.string()
    .max(500)
    .required()
    .description('Name of the venue.'),
  venue_address: Joi.string()
    .max(1000)
    .allow(null, '')
    .description('Address of the venue.'),
  capacity: Joi.number()
    .integer()
    .positive()
    .allow(null, 0)
    .description('Capacity of the venue.'),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE')
    .default('ACTIVE')
    .description('Status of the venue.'),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});
exports.getVenueValidationSchema = Joi.object({
  venue_id: Joi.number().integer().optional(),
  venue_uuid: Joi.string().guid().allow(null).optional(),
  venue_address: Joi.string().allow(null).optional(),
  capacity: Joi.number().integer().allow(null).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
  to_date: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'to_date must be in YYYY-MM-DD format.',
  }),
  from_date: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'from_date must be in YYYY-MM-DD format.',
  }),

  column: Joi.array().items(Joi.string()).optional(),
  value: Joi.string().optional(),
  pageNo: Joi.number().integer().min(1).default(1),
  itemPerPage: Joi.number().integer().min(1).default(10),
  pageLimit: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('The maximum number of pages allowed.'),
  advanceFilter: Joi.array()
    .items(
      Joi.object({
        column: Joi.array().items(Joi.string()).required(),
        operator: Joi.string()
          .valid(
            'EQUAL',
            'NOT_EQUAL',
            'GREATER',
            'LESSER',
            'GREATER_THAN_EQUAL',
            'LESSER_THAN_EQUAL',
            'CONTAINS',
            'STARTS_WITH',
            'ENDS_WITH',
            'DATE_RANGE',
          )
          .required(),
        value: Joi.string().required(),
        logicalOperator: Joi.string().valid('AND', 'OR').optional(),
      }),
    )
    .optional(),
});
