const Joi = require('joi');

exports.upsertLeadSchema = Joi.object({
  leads_uuid: Joi.string().guid().allow('', null),
  lead_code: Joi.string().max(10).required(),
  insurance_type: Joi.string().max(500).allow(null, ''),
  insurance_sub_type: Joi.string().max(500).allow(null, ''),
  first_name: Joi.string().max(500).required(),
  last_name: Joi.string().max(500).required(),
  email: Joi.string().email().max(1000).required(),
  phone: Joi.string().max(20).required(),
  business_name: Joi.string().max(500).allow(null, ''),
  lead_source: Joi.string().max(500).allow(null, ''),
  specify: Joi.string().max(100).allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  comment: Joi.string().max(1000).allow(null, ''),
  time_to_contact: Joi.string().max(1000).allow(null, ''),
  assigned_to_id: Joi.number().integer().allow(null),
  status: Joi.string()
    .valid('ONGOING' | 'CANCELLED' | 'BOOKED' | 'POSTPONED')
    .default('ONGOING')
    .required(),
});
exports.leadValidationSchema = Joi.object({
  leads_uuid: Joi.string().guid().allow('', null),
  lead_code: Joi.string().max(20).allow('', null),
  email: Joi.string().email().max(50).required(),
  date_of_visit: Joi.string()
    .isoDate()
    .required()
    .description('The date when the lead visited'),
  venue_uuid: Joi.string().guid().allow('', null),

  function_date: Joi.string().isoDate().required(),
  function_month: Joi.string().max(20).allow(null),
  followup_date: Joi.string().allow(null),
  name_of_guest: Joi.string().max(100).required(),
  contact_number_1: Joi.string().max(15).required(),
  event_type: Joi.string().max(50).required(),
  number_of_guests: Joi.number().integer().required(),
  handled_by_employee: Joi.string().max(100).required(),
  alt_function_month: Joi.string().max(20).allow(null),
  contact_number_2: Joi.string().max(15).allow(null),
  event_time: Joi.string().max(20).required(),
  preferred_venue: Joi.string().max(100).required(),
  number_of_rooms: Joi.number().integer().allow(null),
  remarks: Joi.string().allow(null),
  status: Joi.string()
    .allow('ONGOING', 'CANCELLED', 'BOOKED', 'POSTPONED')
    .default('ONGOING'),
  created_by_uuid: Joi.string().guid(),
  created_by_name: Joi.string(),
  modified_by_uuid: Joi.string().guid(),
  modified_by_name: Joi.string(),
});

exports.getLeadSchema = Joi.object({
  leads_uuid: Joi.string().guid().allow('', null),
  lead_code: Joi.string().max(10).allow('', null),
  venue_uuid: Joi.string().guid().allow('', null),

  leads_unique_id: Joi.number().integer().allow(null),
  leads_id: Joi.number().integer().allow(null), // New field added
  status: Joi.string()
    .valid('ONGOING', 'CANCELLED', 'BOOKED', 'POSTPONED')
    .allow(null),
  from_date: Joi.string().isoDate().allow(null),
  to_date: Joi.string().isoDate().allow(null),
  column: Joi.array().items(Joi.string()).allow(null),
  value: Joi.string().max(1000).allow(null),
  pageNo: Joi.number().integer().min(1).default(1),
  pageLimit: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('The maximum number of pages allowed.'),
  itemPerPage: Joi.number().integer().min(1).default(10),
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
        value: Joi.string().allow(null),
        logicalOperator: Joi.string().valid('AND', 'OR').required(),
      }),
    )
    .allow(null),
});

// exports.createOpportunitySchema = Joi.object({
//   opportunity_uuid: Joi.string().guid().allow('', null),

//   lead_code: Joi.string().max(10).required(),
//   first_name: Joi.string().required(),
//   last_name: Joi.string().required(),
//   email: Joi.string().email().required(),
//   phone: Joi.string().required(),
//   lead_id: Joi.string().default(null),
//   // lead_source: Joi.string().default(null),
//   insurance_type: Joi.string().default(null),
//   insurance_sub_type: Joi.string().default(null),
//   notes: Joi.string().default(null),
//   comment: Joi.string().default(null),
//   time_to_contact: Joi.string().default(null),
//   assigned_to_id: Joi.number().default(0),
//   due_amount: Joi.string().default(null),
//   amount: Joi.number().default(null),
//   type: Joi.string().default(null),
//   source: Joi.string().default(null),
//   specify: Joi.string().default(null),
//   probability: Joi.string().default(null),
//   business_name: Joi.string().default(null),
//   next_step: Joi.string().default(null),
//   description: Joi.string().default(null),
//   file_upload: Joi.string().default(null),
//   created_by_uuid: Joi.string().guid(),
//   created_by_name: Joi.string(),
//   modified_by_uuid: Joi.string().guid(),
//   modified_by_name: Joi.string(),
//   status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE')
// });
