const {
  responser,
  getData,
  removeNullValueKey,
  throwError,
  setDateTimeFormat,
} = require('../../utils/helperFunction');

const { v4 } = require('uuid');
const {
  getRecords,
  insertRecords,
  isEditAccess,
  isApprovalAccess,
  filterFunctionality,
  roleFilterService,
  pagination,
  getCountRecord,
  dbRequest,
  getTableColumnsNames,
  upsertRecords,
  generateDynamicSQLService,
  getFieldAndType,
} = require('../../utils/dbFunctions');
const ms = require('../../utils/microservice_func');
const { base_url } = require('../../config/server.config');
const { options } = require('joi');
require('dotenv').config();

const uuid = v4;

// send-grid
exports.sendGridEmail = async (req, res) => {
  const {
    module_name,
    module_uuid,
    emails,
    subject,
    body,
    templateName,
    templateId,
    objectVariables,
    cc,
    bcc,
    reply_to,
    attachments,
  } = req.body;

  if (templateId) {
    let resp = await requestApi(
      base_url + '/api/v1/template/render-template',
      null,
      'POST',
      {
        'Content-Type': 'application/json',
        'auth-Tokne': await getSystemUserToken(),
      },
      {
        template_code: templateId,
        payload: objectVariables,
      },
    );
    body = resp.data.body;
    subject = resp.data.subject;
  }

  await ms.sendEmailService(
    emails,
    subject,
    body,
    templateName,
    objectVariables,
    cc,
    bcc,
    reply_to,
    attachments,
  );
  res.json(responser('Email has been sent successfully'));

  //Email_history save
  (async () => {
    try {
      const bodyData = {
        module_name: module_name,
        module_uuid: module_uuid,
        from_email: req.user.email,
        subject: req.body.subject,
        to_mail_ids: req.body.emails,
        cc_mail_ids: req.body.cc,
        bcc_mail_ids: req.body.bcc,
        // body: { body: req.body.body },
        body: { content: req.body.body, contentType: 'html' },
        attachments: attachments,
        comment: req.body.comment,
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-email-history',
        null,
        'json',
        bodyData,
        'POST',
        req.headers,
      );
    } catch (error) {
      console.log('Error in email_history:', error);
    }
  })();

  //history save
  (async () => {
    try {
      let historyMessage = '';
      historyMessage = `${
        req.user?.first_name
      } has sent a email to ${req.body.emails.toString()}`;
      const bodyData = {
        module_name,
        module_uuid,
        message: historyMessage,
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log('Error in history:', error);
    }
  })();
};

exports.uploadFiles = async (req, res) => {
  if (!req.files) {
    return throwError(404, 'No file uploaded.');
  }
  console.log('Files: ', req.files);
  console.log('req.body: ', req.body);
  req.body.files = Array.isArray(req.files.files)
    ? req.files.files
    : [req.files.files];
  let filesPath = await ms.uploadService(req.body);
  res.json(responser('File has been uploaded successfully.', filesPath));

  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];

      historyMessage = `${userInfo?.first_name} file is being uploaded`;

      const bodyData = {
        module_name: 'Upload',
        message: historyMessage,
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.downloadFiles = async (req, res) => {
  const { type, keys } = req.body;
  let jsonArray = await ms.downloadFileS3(keys);
  if (type === 'json') return res.json(jsonArray);
  jsonArray = jsonArray.map((ele) => Buffer.from(ele));
  let fileName = req.body.keys[0].split('/').at(-1);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(jsonArray[0]);

  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];

      historyMessage = `${userInfo?.first_name} file is being downloaded`;

      const bodyData = {
        module_name: 'Download',
        message: historyMessage,
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.getInboxMicrosoftGraph = async (req, res) => {
  const { email } = req.query;
  const inbox = await ms.getInboxMicrosoftgraph(email);
  res.json(responser('Inbox', inbox));
};
exports.generateDynamicSQL = async (req, res) => {
  const { views, onConditions, whereConditions } = req.body;
  let sqlQuery = await generateDynamicSQLService(
    views,
    onConditions,
    whereConditions,
  );
  res.json(responser('Dynamic SQL', sqlQuery));
};

exports.searchMicrosoftGraph = async (req, res) => {
  const { searchType, search, email } = req.query;
  const searchSubject = await ms.searchMicrosoftgraph(
    searchType,
    search,
    email,
  );
  res.json(responser('Search Subjbect: ', searchSubject));
};

exports.getMicrosoftGraphUnreadEmails = async (req, res) => {
  const email = process.env.EMAIL_REPLY_TO;
  const tableName = 'email_history';
  const unreadInbox = await ms.getInboxMicrosoftgraphOnlyUnread(email);
  const emails = unreadInbox.data;
  var message = 'No emails found.';

  let payload = [];

  let create_ts = setDateTimeFormat('timestemp');
  if (emails.length > 0) {
    for (let item of emails) {
      const lowercaseInput = item.subject;
      const regexPattern = /#ENQ_/;
      var pattern = /ENQ_(\d+)/;
      var result = lowercaseInput.match(pattern);
      if (regexPattern.test(lowercaseInput)) {
        const bodyData = {
          email_history_uuid: v4(),
          email_conversation_id: item.conversationId,
          module_name: 'ENQUIRY',
          module_uuid: result[0],
          from_email: item.sender.emailAddress.address,
          subject: item.subject,
          to_mail_ids: [email],
          cc_mail_ids: item.ccRecipients,
          bcc_mail_ids: item.bccRecipients,
          body: item.body,
          send_received_ts: setDateTimeFormat(
            'timestemp',
            item.receivedDateTime,
          ),
          create_ts,
        };
        payload.push(bodyData);
      }
    }
    if (payload.length > 0) await insertRecords(tableName, payload);

    await dbRequest(`
    INSERT INTO enquiry (${await getTableColumnsNames('enquiry')})
    (SELECT ${(
      await getTableColumnsNames('enquiry', null, { alias: 'le' })
    ).replace(
      '`le`.`communication_status`',
      "'RESPONSE_RECIEVED' as `communication_status`",
    )} FROM latest_enquiry le
    INNER join latest_email_history leh on le.enquiry_no=leh.module_uuid and leh.create_ts='${create_ts}')
    `);

    // Update each message to mark it as read
    emails.map(async (message) => await ms.markEmailAsRead(email, message.id));
    message = 'Data Stored';
  }
  res.status(200).json(responser(message));
};

exports.sendEmailMicrosoftGraph = async (req, res) => {
  const { email, subject, body, toRecipients, ccRecipients, attachments } =
    req.body;

  await ms.sendEmailMicrosoftgraph(
    email,
    subject,
    body,
    toRecipients,
    ccRecipients,
    attachments,
  );

  res.json(responser('Email has been sent successfully'));

  //Email_history save
  (async () => {
    try {
      let emailComment = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];

      emailComment = `${userInfo?.first_name} mail has been sent`;

      const bodyContent = req.body.body.content;
      const toMailIds =
        (toRecipients && toRecipients.map((to) => to.emailAddress.address)) ||
        [];
      const ccMailIds =
        (ccRecipients && ccRecipients.map((cc) => cc.emailAddress.address)) ||
        'noccemail';

      const bodyData = {
        module_name: 'Send Email',
        subject: req.body.subject,
        // to_mail_ids: req.body.toRecipients[0].emailAddress.address,
        // to_mail_ids: toMailIds,
        to_mail_ids: toMailIds.length > 0 ? toMailIds.join(',') : 'No toemail',
        cc_mail_ids: ccMailIds.length > 0 ? ccMailIds.join(',') : 'No ccmail',
        body: bodyContent,
        attachments: attachments,
        comment: emailComment,
        created_by_uuid: req.body.created_by_uuid,
      };

      await getData(
        base_url + '/api/v1/history/upsert-email-history',
        null,
        'json',
        bodyData,
        'POST',
        req.headers,
      );
    } catch (error) {
      console.log(error);
    }
  })();

  // history save
  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];

      historyMessage = `${userInfo?.first_name} mail has been sent`;

      const bodyData = {
        module_name: 'Send Email',
        message: historyMessage,
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.statusApproval = async (req, res) => {
  removeNullValueKey(req.body);
  // await isApprovalAccess('approval', req.user);
  const {
    table_name,
    record_uuid,
    record_id,
    record_column_name,
    approved_by_uuid,
    requested_by_uuid,
  } = req.body;
  await isApprovalAccess(
    table_name,
    record_uuid,
    record_id,
    record_column_name,
    approved_by_uuid,
    requested_by_uuid,
  );

  let approvalMessage = 'Please Approve this request';

  let record_info = await getRecords(
    `latest_${table_name}`,
    `where ${record_column_name}='${record_uuid}'`,
  );
  if (!record_info.length) throwError(404, 'Record not found.');
  record_info = record_info[0];

  if (req.body.status === 'APPROVED') {
    if (req.user.user_uuid == req.body.approved_by_uuid) {
      approvalMessage = 'Approval Request has been Approved.';
      let approvalInfo = await getRecords(
        'latest_approval',
        `where approval_uuid='${req.body.approval_uuid}'`,
      );
      if (!approvalInfo.length) throwError(404, 'approval not found.');
      approvalInfo = approvalInfo[0];

      let enquiry_info = await getRecords(
        `latest_enquiry`,
        `where enquiry_no='${record_info.enquiry_no}'`,
      );
      if (!enquiry_info.length) throwError(404, 'Enquiry not found.');
      enquiry_info = enquiry_info[0];
      req.body.previous_status = enquiry_info.status;
      enquiry_info.status = approvalInfo.next_status;
      enquiry_info.create_ts = setDateTimeFormat(
        'timestemp',
        enquiry_info.create_ts,
      );
      const insertedEnquiry = await insertRecords('enquiry', enquiry_info);
    } else {
      return res.json(
        responser('You are not the Valid Person to Approve this Request.'),
      );
    }
  } else if (req.body.status === 'ROLLBACK') {
    if (req.body.created_by_uuid == req.user.user_uuid) {
      approvalMessage = 'Approval Request has been Rollbacked.';
    } else {
      res.json(
        responser('You are not the Valid Person to Rollback this Request.'),
      );
    }
  }

  let approvalRecordInfo = await getRecords(
    `latest_${table_name}`,
    `where ${record_column_name}='${record_uuid}'`,
  );

  if (!approvalRecordInfo.length)
    throwError(404, 'approvalRecordInfo not found and access cannot be given.');
  approvalRecordInfo = approvalRecordInfo[0];

  let isUpadtion = false;
  if (req.body.approval_uuid) {
    isUpadtion = true;
    let approval_info = await getRecords(
      'latest_approval',
      `where approval_uuid='${req.body.approval_uuid}'`,
    );
    if (!approval_info.length) throwError(404, 'approval not found.');
    approval_info = approval_info[0];
    approval_info.create_ts = setDateTimeFormat(
      'timestemp',
      approval_info.create_ts,
    );
    req.body = { ...approval_info, ...req.body };
  } else {
    req.body.create_ts = setDateTimeFormat('timestemp');
    req.body.approval_uuid = uuid();
  }
  const insertedApproval = await insertRecords('approval', req.body);
  const respData = {
    reqBody: req.body,
    approvalRecordInfo: approvalRecordInfo,
  };
  res.json(responser('Approval created successfully.', respData));

  // Send Mail
  (async () => {
    try {
      let userInfoReceiver = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.approved_by_uuid}'`,
        )
      )[0];

      let receiverEmail = userInfoReceiver.email;

      let userInfoSender = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];

      const emailBody = JSON.stringify(approvalRecordInfo);

      let bodyMail = `
        <h1>Approval Alert</h1>
        <h1 style='color: red;'>${approvalMessage}</h1>
        <p>Subject: Inquiry Regarding Approval- Sales Inquiry</p>
        <p>Dear ${userInfoReceiver.first_name},</p>
      <h3>You have a request for approval for Enquiry: ${approvalRecordInfo.enquiry_no}</h3>
    
      <ul>
        <li>Assigned By: ${userInfoSender.first_name}  </li>
        <li>Email: ${userInfoSender.email}</li>
        <li>Regarding Enquiry No.: ${approvalRecordInfo.enquiry_no}</li>
        <li>Assigned to : ${userInfoReceiver.first_name}  </li>
      </ul>
      <h1 style='color: black;'>${approvalMessage}</h1>
      `;

      if (req.body.status === 'APPROVED') {
        receiverEmail = userInfoSender.email;
        bodyMail = `
        <h1>Approval Alert</h1>
        <h1 style='color: red;'>${approvalMessage}</h1>
        <p>Subject: Inquiry Regarding Approval- Sales Inquiry</p>
        <p>Dear ${userInfoSender.first_name},</p>
        <h3>Your request for approval for Enquiry: ${approvalRecordInfo.enquiry_no} has been approved.</h3>`;
      }

      const bodyData = {
        module_name: req.body.table_name,
        module_uuid: req.body.record_uuid,
        emails: [receiverEmail],
        subject: approvalRecordInfo.enquiry_no,
        body: bodyMail,
        cc: req.body.cc,
        bcc: req.body.bcc,
      };

      await getData(
        base_url + '/api/v1/general/send-grid-email',
        null,
        'json',
        bodyData,
        'POST',
        req.headers,
      );
      // await exports.sendGridEmail(bodyData);
    } catch (error) {
      console.log(error);
    }
  })();

  // Save History
  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.user.user_uuid}'`,
        )
      )[0];
      if (isUpadtion) {
        historyMessage = `${userInfo?.first_name} has made an update in Approval of tablename: ${req.body.table_name} on request of uuid: ${req.body.requested_by_uuid}`;
      } else {
        historyMessage = `${userInfo?.first_name} has created a Aproval of tablename: ${req.body.table_name} on request of uuid: ${req.body.requested_by_uuid}`;
      }

      const moduleId = insertedApproval.insertId;
      const bodyData = {
        module_name: 'Approval',
        module_uuid: req.body.approval_uuid,
        module_id: moduleId,
        message: historyMessage,
        module_column_name: 'approval_uuid',
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.covertBase64ToBuffer = async (req, res) => {
  const { base64Array } = req.body;
  const bufferArray = base64Array.map((ele) => {
    if (ele.includes(';base64,')) {
      return Buffer.from(ele.split(';base64,').pop(), 'base64').toJSON();
    } else {
      return Buffer.from(ele, 'base64').toJSON();
    }
  });
  res.json(responser('Base to Buffer', bufferArray));
};

exports.getTableInfo = async (req, res) => {
  const {
    table_name,
    status,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    columns,
    value,
  } = req.query;
  let tableName = 'tables_reference';
  let filter = filterFunctionality(
    {
      table_name,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  return res.json(
    responser('Table info ', result, result.length, totalRecords),
  );
};

exports.getTableNameOrColumnName = async (req, res) => {
  try {
    const { table_name, table_type, is_data_type_required } = req.query;
    let result = [];

    if (table_name) {
      // Get all column names for the specified table
      const columnName = await dbRequest(
        `SELECT column_name ${is_data_type_required === 'true' ? ', data_type' : ''} FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '${table_name}'`,
      );

      console.log('columnName==>', columnName);

      if (!columnName.length) {
        return throwError(404, 'Table not found in database');
      }

      // // Get primary key of the table
      // const primaryKey = await getTableColumnsNames(table_name);
      // if (!primaryKey) {
      //   return throwError(500);
      // }

      // Define columns to exclude
      // const valuesToDelete = ['insert_ts', 'create_ts'];
      if (!table_name.includes('latest_')) {
        valuesToDelete.push(primaryKey.replace(/`/g, ''));
      }

      // Filter out excluded columns
      // const filteredResult = columnName.filter(
      //   (item) => !valuesToDelete.includes(item.COLUMN_NAME),
      // );

      // Push filtered column names to result array
      if (is_data_type_required !== 'true') {
        for (const obj of columnName) {
          if (!obj.COLUMN_NAME.includes('_uuid')) {
            result.push(obj.COLUMN_NAME);
          }
        }
      } else {
        result = columnName;
        result = result.filter((item) => !item.COLUMN_NAME.includes('_uuid'));
      }
      return res.json(responser(`All columns of ${table_name}`, result));
    }

    // If no table_name provided, get all views
    const allViewsName = await dbRequest(
      `SELECT table_name FROM information_schema.tables WHERE table_type = '${table_type}' AND table_schema = DATABASE()`,
    );
    console.log(allViewsName);
    if (!allViewsName) {
      return throwError(500, 'No views found in database');
    }

    // Push all view names to result array
    for (const obj of allViewsName) {
      result.push(obj.TABLE_NAME);
    }

    return res.json(responser('All Views list', result));
  } catch (error) {
    console.log(error);
    return throwError(500, error.message);
  }
};

exports.getRecordCount = async (req, res) => {
  let { table_name, to_date, from_date, pageNo, itemPerPage } = req.query;
  let filter = filterFunctionality({}, null, to_date, from_date);
  filter = await roleFilterService(filter, table_name, req.user);

  const query = `
      SELECT Count(*) as count, status
      FROM ${table_name}
       ${filter}  
      GROUP BY status;
    `;

  let totalRecords = await dbRequest(query);
  console.log(totalRecords);
  return res.json(responser('Total records', totalRecords));
};
