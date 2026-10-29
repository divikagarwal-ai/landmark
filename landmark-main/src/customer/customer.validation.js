const Joi = require('joi');

exports.updateCustomerSchema = Joi.object({
  customer_fact_uuid: Joi.string().required(),
  customer_code: Joi.string().allow(null, ''),
  customer_name: Joi.string().allow(null, ''),
  father_name: Joi.string().allow(null, ''),
  mother_name: Joi.string().allow(null, ''),
  date_of_birth: Joi.string().isoDate().allow(null, ''),
  caste_category: Joi.string().allow(null, ''),
  inquiry_date: Joi.string().isoDate().allow(null, ''),
  batch: Joi.string().max(50).allow(null, ''),
  courses_duration: Joi.string().max(50).allow(null, ''),
  course_fee_structure: Joi.string().allow(null, ''),
  courses_fees: Joi.string().allow(null, ''),
  organizations_uuid: Joi.string().guid().allow(null, ''),
  organizations_name: Joi.string().allow(null, ''),
  courses_uuid: Joi.string().guid().allow(null, ''),
  courses_name: Joi.string().allow(null, ''),
  course_duration: Joi.string().max(50).allow(null, ''),
  admission_date: Joi.string().isoDate().allow(null, ''),
  seat_confirmation_fee: Joi.string().allow(null, ''),
  caste_category: Joi.string().allow(null, ''),
  remarks: Joi.string().allow(null, ''),
  followUp_date_and_remark: Joi.string().allow(null, ''),
  hostel_required: Joi.string().allow(null, ''),
  inquiry_reference: Joi.string().allow(null, ''),
  qualifications: Joi.array().allow(null),
  gap_year: Joi.number().integer().allow(null, ''),
  fathers_occupation: Joi.string().allow(null),
  mothers_occupation: Joi.string().allow(null),
  docs_upload: Joi.string().allow(null, ''),
  family_income: Joi.string().allow(null, ''),
  annual_income: Joi.string().allow(null, ''),
  aadhar_no: Joi.string().allow(null, ''),
  gender: Joi.string().allow(null, ''),
  contact_no: Joi.string().allow(null, ''),
  alternate_contact_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, ''),
  parents_contact_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, ''),
  city: Joi.string().allow(null, ''),
  state: Joi.string().allow(null, ''),
  pincode: Joi.number().integer().allow(null, ''),
  country: Joi.string().allow(null, ''),
  permanent_address: Joi.string().allow(null, ''),
  email_id: Joi.string().allow(null, ''),
  status: Joi.string().allow(null, ''),
  created_by_uuid: Joi.string().guid(),
  created_by_name: Joi.string(),
  modified_by_uuid: Joi.string().guid(),
  modified_by_name: Joi.string(),
});

exports.createCustomerSchema = Joi.object({
  first_name: Joi.string().max(500).required(),
  email: Joi.string().email().max(1000).required(),
  phone: Joi.string().max(20).required(),
  customer_id: Joi.string().allow(null), // If it can be a string or null
  salutation: Joi.string().allow(null), // Optional, if the customer prefers a title (Mr./Ms.)
  last_name: Joi.string().max(500).allow(null), // Optional, if last name is available
  goes_by: Joi.string().max(500).allow(null), // Optional, if customer prefers a different name
  position: Joi.string().max(500).allow(null), // Optional, job position of the customer
  mobile: Joi.string().max(20).allow(null), // Optional, mobile number
  phone_ext: Joi.string().max(10).allow(null), // Optional, phone extension
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE').required(), // Ensure status is one of these values
});
