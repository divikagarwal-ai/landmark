const Joi = require('joi');
const { roleFilterService } = require('../../utils/dbFunctions');

exports.upsertRoleSchema = Joi.object({
  role_uuid: Joi.string().guid().max(50).allow('', null),
  role_name: Joi.string().min(2).max(100).required(),
  role_group: Joi.string().min(2).max(100).required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});

exports.getRoleSchema = Joi.object({
  role_id: Joi.number().integer(),
  role_uuid: Joi.string().guid().max(50),
  pageNo: Joi.number().integer().min(1),
  itemPerPage: Joi.number().integer().min(1),
  from_date: Joi.string().isoDate(),
  to_date: Joi.string().isoDate(),
  status: Joi.string(),
  columns: Joi.string(),
  value: Joi.string(),
});

exports.upsertSecurityRoleModuleSchema = Joi.array().items(
  Joi.object({
    role_module_uuid: Joi.string().guid().allow(null),
    module_uuid: Joi.string().guid(),
    role_uuid: Joi.string().guid(),
    show_module: Joi.number().valid(0, 1),
    view_access: Joi.number().valid(0, 1),
    edit_access: Joi.number().valid(0, 1),
    delete_access: Joi.number().valid(0, 1),
    bulk_import: Joi.number().valid(0, 1),
    bulk_export: Joi.number().valid(0, 1),
    send_sms: Joi.number().valid(0, 1),
    send_mail: Joi.number().valid(0, 1),
    send_whatsapp: Joi.number().valid(0, 1),
    send_call: Joi.number().valid(0, 1),
    created_by_uuid: Joi.string().guid().allow(null),
    created_by_name: Joi.string().allow(null),
    modified_by_uuid: Joi.string().guid().allow(null),
    modified_by_name: Joi.string().allow(null),
  }),
);

exports.getModuleListSchema = Joi.object({
  role_uuid: Joi.string().guid().max(50),
});

exports.upsertRoleRecordAccessPermissionSchema = Joi.object({
  role_filter_uuid: Joi.string().guid().allow(null),
  role_uuid: Joi.string().guid(),
  module_uuid: Joi.string().guid(),
  filter_values: Joi.object(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});

exports.getRoleRecordAccessPermissionSchema = Joi.object({
  role_uuid: Joi.string().guid().max(50),
});
