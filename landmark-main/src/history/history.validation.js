const Joi = require('joi');

exports.postHistorySchema = Joi.object({
  history_uuid: Joi.string().guid().max(100).allow('', null),
  module_name: Joi.string().max(100).required(),
  module_uuid: Joi.string().max(100).allow(null, ''),
  module_id: Joi.number().integer().allow(null, ''),
  module_column_name: Joi.string().max(100).allow(null, ''),
  message: Joi.string().allow('').optional().allow(null),
  payload: Joi.object().allow(null),
  remark: Joi.string().allow(null),
  status: Joi.string().allow(null),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});

exports.getHistorySchema = Joi.object({
  history_id: Joi.number().integer(),
  history_uuid: Joi.string().guid(),
  module_uuid: Joi.string().guid(),
  pageNo: Joi.number().integer().min(1),
  itemPerPage: Joi.number().integer().min(1),
  from_date: Joi.string().isoDate(),
  to_date: Joi.string().isoDate(),
  status: Joi.string(),
  columns: Joi.string(),
  value: Joi.string(),
});

exports.upsertEmailHistorySchema = Joi.object({
  email_history_uuid: Joi.string().guid().max(100).allow('', null),
  email_conversation_id: Joi.string().allow(null),
  module_uuid: Joi.string().max(100).allow('', null),
  module_name: Joi.string().max(100).allow('', null),
  from_email: Joi.string().email(),
  subject: Joi.string().default(''),
  to_mail_ids: Joi.array(),
  cc_mail_ids: Joi.array(),
  bcc_mail_ids: Joi.array().allow(null),
  body: Joi.object(),
  attachments: Joi.array().items(Joi.object()).allow('', null),
  comment: Joi.string().allow('', null),
  send_received_ts: Joi.string().allow('', null),
  created_by_uuid: Joi.string().guid().max(50).allow('', null),
});

exports.getEmailHistorySchema = Joi.object({
  email_history_id: Joi.number().integer(),
  email_history_uuid: Joi.string(),
  module_uuid: Joi.string().max(100),
  pageNo: Joi.number().integer().min(1),
  itemPerPage: Joi.number().integer().min(1),
  from_date: Joi.string().isoDate(),
  to_date: Joi.string().isoDate(),
  status: Joi.string(),
  columns: Joi.string(),
  value: Joi.string(),
});
