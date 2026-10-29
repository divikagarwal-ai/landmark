const Joi = require('joi');

exports.upsertUserSchema = Joi.object({
  user_uuid: Joi.string().allow(null),
  email: Joi.string().email().required(),
  role_uuid: Joi.string().guid().required(),
  user_password: Joi.string().allow(null).min(7),
  first_name: Joi.string().required().min(3),
  last_name: Joi.string().allow('', null).min(1),
  // mobile_no: Joi.string()
  //   .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
  //   .message('Invalid mobile number')
  //   .allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'UNAUTHORIZE', 'BLOCKED'),
  created_by_uuid: Joi.string().guid().allow(null),
  created_by_name: Joi.string().allow(null),
  modified_by_uuid: Joi.string().guid().allow(null),
  modified_by_name: Joi.string().allow(null),
});

exports.userVerification = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
  action: Joi.string(),
});

exports.userLogin = Joi.object({
  emailOrUsername: Joi.string().required(),
  password: Joi.string().required().min(7),
});

exports.validateOtpGetToken = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
});

exports.forgotPassword = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().allow(null),
  user_password: Joi.string().allow(null).min(7),
  action: Joi.string().valid('SEND', 'MATCH'),
});

exports.userLogout = Joi.object({
  user_uuid: Joi.string().guid().required(),
  sessionCount: Joi.number().allow(null),
});
