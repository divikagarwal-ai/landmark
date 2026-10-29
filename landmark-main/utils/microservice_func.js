const { SERVICES_URL } = require('./microservices_url');
const config = require('../config/server.config');
const {
  getData,
  throwError,
  responser,
  deleteKeyValuePair,
  removeNullValueKey,
  compareObjects,
} = require('./helperFunction');
const { getRecords, dbRequest } = require('./dbFunctions');
const { findKeysWithPhrase, requestApi } = require('./helperFunction');
const moment = require('moment');
const axios = require('axios');
/**
 * Send Normal Email or email with template
 * @param {Array<string>} to Recipients emails
 * @param {string} subject Subject for email
 * @param {string} body Plain text or html
 * @param {string} template Template name for sending with email
 * @param {object} objectVariables it will be variables that used in the template
 * @param {Array<string>} cc CC emails
 * @param {Array<string>} bcc BCC emails
 * @param {{email?:string,name:string}} reply_to it will be variables that used in the template
 * @param {Array<{
 * content: bufferString,
 * filename: string
 * }>} attachments attachments for share files with emails
 * @returns {Promise}
 */
exports.sendEmailService = async (
  to,
  subject,
  body,
  template,
  objectVariables,
  cc,
  bcc,
  reply_to,
  attachments,
) => {
  console.log(to, 'to');
  console.log(subject, 'subject');
  console.log(body, 'body');
  console.log(template, 'template');
  console.log(objectVariables, 'objectVariables');
  console.log(cc, 'cc');
  console.log(bcc, 'bcc');
  console.log(reply_to, 'reply_to');
  return await getData(SERVICES_URL.sendEmail, null, 'json', {
    to,
    subject,
    body,
    template,
    objectVariables,
    cc,
    bcc,
    reply_to,
    attachments,
  });
};

/**
 * Generate PDF
 * @param {Array<{templateName:string,data:object}>} template_instances Name of the pdf template file
 * @param {{displayHeaderFooter:boolean,isTitlePage:boolean}} options other pdf options
 * @returns {Promise<Buffer>} Buffer format of the PDF file
 */
exports.pdfMaker = async (template_instances, options) => {
  let pdfBufffer = await requestApi(
    SERVICES_URL.pdfGenerator,
    null,
    'POST',
    { 'Content-Type': 'application/json' },
    {
      template_instances,
      options,
    },
  );
  return pdfBufffer;
};

/**
 * Twilio service for whatsapp, sms and calls
 * @param {("whatsapp"|"sms"|"call")} type
 * @param {array<{to:string,name:"string"}>} data
 * @returns {Promise<0|1>}
 */

exports.twilio = async (type, data = null) => {
  try {
    const successArray = data.map((recipent) =>
      getData(
        type === 'whatsapp'
          ? SERVICES_URL.whatsapp
          : type === 'call'
            ? SERVICES_URL.call
            : SERVICES_URL.sms,
        null,
        'json',
        recipent,
      ),
    );
    Promise.all(successArray);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

/**
 * @param {{module_name:string,as_payload:Object,files:{data:buffer,name:string}[],options:{encryption:boolean,password:string|null}|null}} data
 * @returns {Promise<string[]>} Array of file paths
 */
exports.uploadService = async (data) => {
  let as_payload = {};
  try {
    as_payload = { ...JSON.parse(data.as_payload) };
  } catch (_) {}
  let getfilePath = await getRecords(
    'attachments_structure',
    `where module_name= "${data.module_name}"`,
  );
  if (!getfilePath.length) return throwError(404, 'Module name is not valid');
  getfilePath = getfilePath[0].file_path;
  const pattern = /\${as_payload\.([^}]+)}/g;
  data.files = data.files.map((file) => {
    let splitName = file.name.split('.');
    as_payload['file_ext'] = splitName.at(-1);
    as_payload['filename'] = file.name

      //log
      .replace(`.${as_payload.file_ext}`, '')
      .replace(/[^\w]/g, '_');
    console.log('file name', as_payload);

    let match;
    while ((match = pattern.exec(getfilePath)) !== null) {
      const payloadKey = match[1];
      console.log(payloadKey, 'key');

      if (!as_payload.hasOwnProperty(payloadKey)) {
        return throwError(422, `'${payloadKey}' is need to be in as_payload`);
      }
    }
    file.name = eval('`' + getfilePath + '`');
    file.name = file.name.replace(/\//g, '|');
    return file;
  });
  console.log(data.files, 'files');

  let resp = await requestApi(
    SERVICES_URL.s3UploadFiles,
    null,
    'POST',
    { 'Content-Type': 'multipart/form-data' },
    {
      files: data.files,
    },
  );
  if (!resp) throwError(400, 'File is not uploaded.');

  console.log(resp);
  return resp.filePath;
};
/**
 * Download File from S3
 * @param {array<string>} keys unique file or object name
 * @returns {Promise<Buffer>}
 */
exports.downloadFileS3 = async (keys) => {
  return await getData(SERVICES_URL.downloadFileS3, null, 'json', {
    keys,
    inJson: true,
  });
};

exports.sendSmsService = async (data) => {
  return await getData(SERVICES_URL.sendSms, null, 'json', data, 'POST');
};
exports.sendWhatsAppService = async (data) => {
  return await getData(SERVICES_URL.sendWhatsapp, null, 'json', data, 'POST');
};
exports.voiceCallService = async (data) => {
  return await getData(SERVICES_URL.sendVoiceCall, null, 'json', data, 'POST');
};

exports.ejsPreview = async (data, templateName) => {
  let ejsText = await getData(SERVICES_URL.ejsPreview, null, 'text', {
    data,
    templateName,
  });
  return ejsText;
};

exports.generateTokenMicrosoftgraph = async (gen) => {
  console.log('Hitting microsoft genrate token function micro');
  return await getData(
    SERVICES_URL.microsoftGraphGenerateToken,
    null,
    'json',
    { gen },
    'POST',
  );
  // return token;
};

exports.getInboxMicrosoftgraph = async (email) => {
  console.log('data: ', email);

  let inbox = await getData(
    SERVICES_URL.microsoftGraphGetInbox,
    { email },
    'json',
    null,
    'GET',
  );
  return inbox;
};

exports.getInboxMicrosoftgraphOnlyUnread = async (email) => {
  let inbox = await getData(
    SERVICES_URL.microsoftGraphGetUnreadEmails,
    { email },
    'json',
    null,
    'GET',
  );
  return inbox;
};

exports.markEmailAsRead = async (email, messageId) => {
  axios
    .patch(SERVICES_URL.microsoftGraphMarkEmailAsRead, null, {
      params: {
        email: email,
        messageId: messageId,
      },
    })
    .then((response) => {
      return 'marked';
    })
    .catch((error) => {
      console.error(
        'Error making PATCH request:',
        error.response ? error.response.data : error.message,
      );
    });
  return 'marked';
};

exports.searchMicrosoftgraph = async (searchType, search, email) => {
  let searchSub = await getData(
    SERVICES_URL.microsoftGraphSearch,
    { searchType, search, email },
    'json',
    null,
    'GET',
  );
  return searchSub;
};

exports.sendEmailMicrosoftgraph = async (
  email,
  subject,
  body,
  toRecipients,
  ccRecipients,
  attachments,
) => {
  return await getData(SERVICES_URL.microsoftGraphSendEmail, null, 'json', {
    email,
    subject,
    body,
    toRecipients,
    ccRecipients,
    attachments,
  });
};

exports.saveHistory = async (
  payload,
  tableName,
  referenceColumn,
  moduleName,
  insertRecordID,
  remark,
  selfUser,
) => {
  try {
    if (!payload.oldRecord) payload.oldRecord = {};
    let payloadChanges = {};
    let isUpadtion =
      payload?.oldRecord && Object.keys(payload.oldRecord).length;
    deleteKeyValuePair(payload.oldRecord, [
      `${tableName}_id`,
      'insert_ts',
      'create_ts',
    ]);
    deleteKeyValuePair(payload.newRecord, [
      `${tableName}_id`,
      'insert_ts',
      'create_ts',
    ]);
    if (isUpadtion) {
      payloadChanges = {
        identifier: {
          column_name: referenceColumn,
          column_value: payload.newRecord[referenceColumn],
        },
        changed_column: compareObjects(payload.oldRecord, payload.newRecord),
      };
    } else {
      payloadChanges = {
        identifier: {
          column_name: referenceColumn,
          column_value: payload.newRecord[referenceColumn],
        },
        no_changed_column: payload.newRecord,
      };
    }
    let historyMessage = `${payload.newRecord.modified_by_name} has ${isUpadtion ? 'updated' : 'created'} this ${moduleName.toLowerCase()}`;
    const bodyData = {
      module_name: moduleName,
      module_uuid: payload.newRecord[referenceColumn],
      module_id: insertRecordID,
      message: historyMessage,
      module_column_name: referenceColumn,
      payload: payloadChanges,
      remark: remark,
      modified_by_uuid: payload.newRecord.modified_by_uuid,
      modified_by_name: payload.newRecord.modified_by_name,
      status: isUpadtion ? 'UPDATE' : 'CREATE',
    };

    await requestApi(
      config.base_url + '/api/v1/history/upsert-history',
      null,
      'POST',
      {
        'Content-Type': 'application/json',
        'auth-Token': selfUser?.access_token,
      },
      bodyData,
    );
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get WhatsApp Exotel templates
 * @param {{template_name?: string, status?: string, limit?: number}} params Query parameters
 * @returns {Promise<Object>} Template data
 */
exports.getWhatsappExotelTemplateService = async (params = {}) => {
  return await requestApi(SERVICES_URL.whatsappExotelTemplate, params, 'GET', {
    'Content-Type': 'application/json',
  });
};

/**
 * Create WhatsApp Exotel template
 * @param {{category: string, components: Array, name: string, language: string}} templateData Template data
 * @returns {Promise<Object>} Created template response
 */
exports.createWhatsappExotelTemplateService = async (templateData) => {
  return await requestApi(
    SERVICES_URL.whatsappCreateTemplate,
    null,
    'POST',
    { 'Content-Type': 'application/json' },
    {
      whatsapp: {
        templates: [
          {
            template: templateData,
          },
        ],
      },
    },
  );
};

exports.getWhatsappStatusService = async () => {
  return await requestApi(
    SERVICES_URL.whatsappStatus,
    { baseURL: config.base_url + '/api/v1/conversation' },
    'GET',
  );
};

exports.getQrWhatsappService = async () => {
  return await requestApi(
    SERVICES_URL.whatsappGroupQrCode,
    { baseURL: config.base_url + '/api/v1/conversation' },
    'GET',
  );
};

exports.refreshWhatsappGroupServerService = async () => {
  return await requestApi(
    SERVICES_URL.whatsappGroupRefresh,
    { baseURL: config.base_url + '/api/v1/conversation' },
    'GET',
  );
};

exports.getWhatsappAllGroupListService = async () => {
  return await requestApi(SERVICES_URL.whatsappAllGroupList, null, 'GET');
};
