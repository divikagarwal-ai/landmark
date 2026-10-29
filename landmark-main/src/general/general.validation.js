const Joi = require('joi');

exports.sendGridEmailBodySchema = Joi.object({
  module_name: Joi.string(),
  module_uuid: Joi.string().max(50),
  comment: Joi.string().allow('', null),
  emails: Joi.array().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  templateName: Joi.string().allow('', null),
  objectVariables: Joi.object(),
  cc: Joi.array(),
  bcc: Joi.array(),
  reply_to: Joi.object({
    email: Joi.string().email().allow('', null),
    name: Joi.string().allow('', null),
  }).allow(null),

  attachments: Joi.array(),
  created_by_uuid: Joi.string().allow('', null),
  created_by_name: Joi.string().allow('', null),
  modified_by_uuid: Joi.string().allow('', null),
  modified_by_name: Joi.string().allow('', null),
});

exports.uploadFiles = Joi.object({
  files: Joi.array(),
  module_name: Joi.string(),
  as_payload: Joi.string().allow('', null),
  created_by_uuid: Joi.string().allow('', null),
  created_by_name: Joi.string().allow('', null),
  modified_by_uuid: Joi.string().allow('', null),
  modified_by_name: Joi.string().allow('', null),
});

exports.downloadFiles = Joi.object({
  type: Joi.string().valid('json', '').allow('', null),
  keys: Joi.array(),
  created_by_uuid: Joi.string().allow('', null),
  created_by_name: Joi.string().allow('', null),
  modified_by_uuid: Joi.string().allow('', null),
  modified_by_name: Joi.string().allow('', null),
});

exports.emailConversationSchema = Joi.object({
  email_conversation_uuid: Joi.string().guid().max(50),
  subject: Joi.string().max(100),
  search_type: Joi.string().max(255).default('subject'),
  body: Joi.object().default(null), // JSON object type
  created_by_uuid: Joi.string().max(50).allow(null),
});

exports.upsertstatusApproval = Joi.object({
  approval_uuid: Joi.string().guid().max(50).allow('', null),
  table_name: Joi.string().required(),
  record_uuid: Joi.string().guid().max(50).required(),
  record_id: Joi.number().integer().max(100).allow(null),
  record_column_name: Joi.string().allow('', null),
  approved_by_uuid: Joi.string().guid().max(50),
  requested_by_uuid: Joi.string().guid().max(50),
  previous_status: Joi.string(),
  status: Joi.string()
    .valid('REQUESTED', 'APPROVED', 'ROLLBACK', 'DECLINED')
    .required(),
  next_status: Joi.string(),
  created_by_uuid: Joi.string().guid().max(50).allow('', null),
});

exports.base64ToBufferSchema = Joi.object({
  base64Array: Joi.array().items(Joi.string()).min(1),
});
