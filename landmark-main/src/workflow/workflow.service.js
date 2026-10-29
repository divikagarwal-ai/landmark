const {
  getRecords,
  sendEmailService,
  columnMappingService,
  insertRecords,
  upsertRecords,
  dbRequest,
  generateConditionString,
} = require('../../utils/dbFunctions');
// const {renderTemplateService} = require("../services/template.service")
const { getSystemUserToken } = require('../../utils/helperFunction');
const {
  deleteKeyValuePair,
  throwError,
  getData,
  evaluateConditionWithPayload,
  generateCode,
} = require('../../utils/helperFunction');
const {
  renderTemplateService,
  getEmailBodyByTemplateMapping,
} = require('../template/template.service');
const { errorLoggingTicketRaise } = require('../../utils/microservice_func');

/**
 * Workflow Log entry
 * @param {{
 * workflow_logs_code,
 * workflow_name,
 * step_name,
 * status,
 * error_log
 * }} payload
 */
exports.workflowLogEntry = async (payload) => {
  if (!payload.workflow_logs_code) {
    payload.workflow_logs_code = generateCode({ length: 6 });
    await insertRecords('workflow_logs', payload);
  } else {
    let previousLog = (
      await getRecords(
        'workflow_logs',
        `where workflow_logs_code='${payload.workflow_logs_code}' order by insert_ts desc limit 1`,
      )
    )[0];
    payload = { ...previousLog, ...payload };
    await insertRecords('workflow_logs', payload);
    // await upsertRecords("workflow_logs",payload);
  }
  return payload;
};

async function sendingEmails(emailsArr, logCode, workflowBasicCode) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Sending Emails',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  try {
    console.log(
      'Log Code',
      logCode,
      ' | emails Arr Before correction:',
      emailsArr,
    );
    for (let index in emailsArr) {
      emailsArr[index].to = [...new Set(emailsArr[index].to)];
      emailsArr[index].cc = [...new Set(emailsArr[index].cc)];
      emailsArr[index].bcc = [...new Set(emailsArr[index].bcc)];
      emailsArr[index].cc = emailsArr[index].cc.filter(
        (ccEmail) => !emailsArr[index].to.includes(ccEmail),
      );
      emailsArr[index].bcc = emailsArr[index].bcc.filter(
        (bccEmail) => !emailsArr[index].cc.includes(bccEmail),
      );
    }
    console.log(
      'Log Code',
      logCode,
      ' | emails Arr After correction:',
      emailsArr,
    );
    // Send Email
    let errrorEmails = [];
    for (let ele of emailsArr) {
      try {
        await sendEmailService(
          ele.to,
          ele.subject,
          ele.body,
          null,
          null,
          ele.cc,
          ele.bcc,
        );
      } catch (err) {
        errrorEmails.push(err?.stack || err);
        // errorLoggingTicketRaise(err,{
        //   module_name:"Workflow",
        //   sub_module_name:"Workflow Send Emails",
        //   record_linkage_column:"workflow_log_code",
        //   record_code_or_id:logCode,
        //   table_name:"workflow_logs",
        // },false,true);
      }
      logEntry.error_log = JSON.stringify(errrorEmails);
    }
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Send Emails",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function emailByAPI(emailRecords, payload, logCode, workflowBasicCode) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Action email, call type API',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  let ccBccObj = { cc: [], bcc: [] }; // cc, bcc will be same for all
  let emailPayload = [];
  let errorInNoResponse = [];
  try {
    let token = await getSystemUserToken();
    let headers = {
      'auth-Token': token,
    };
    // let headers = (await getRecords("config_workflow",`where user_fact_id=${907}`,null,["headers"])).result
    // if(headers.length){
    //   headers = headers[0].headers;
    //   console.log("headsers:",headers)
    // }else{
    //   console.log("Log Code",logCode," | NO authorization found for API call");
    //   throw new Error("NO authorization found for API call");
    // }
    for (let obj of payload) {
      // TO recipients
      for (let to of emailRecords.to) {
        let api = to.api.replace(/\$\{/g, '${obj.');
        console.log('Log Code', logCode, ' | api from eval:', api);
        console.log('Log Code', logCode, ' | api:', eval('`' + api + '`'));
        let response = await getData(
          eval('`' + api + '`'), // return data contains email column
          null,
          'json',
          null,
          'GET',
          headers,
        );
        if (response.data.length) {
          let resp = response.data; // eg. {email:"",phone:""...}[]
          console.log('API fetch by email resp==>', resp);
          for (let res of resp) {
            let email = res[to.emailColumn];
            if (emailRecords.sending_order === 'ONE_BY_ONE') {
              let templateResp = await renderTemplateService(
                emailRecords.template_code,
                obj,
              );
              emailPayload.push({ to: [email], ...templateResp });
            } else if (emailRecords.sending_order === 'ALL_AT_ONCE') {
              if (!emailPayload.length) {
                emailPayload.push({ to: [email] });
              } else {
                emailPayload[0].to.push(email);
              }
            }
          }
        } else {
          errorInNoResponse.push(
            `No email found in API response: ${eval('`' + api + '`')}`,
          );
        }
      }
      // CC, BCC recipients
      for (let eccBCC of Object.keys(ccBccObj)) {
        for (let er of emailRecords[eccBCC]) {
          let api = er.api.replace(/\$\{/g, '${obj.');
          console.log(
            'Log Code',
            logCode,
            ' | ' + `${eccBCC} api from eval:`,
            api,
          );
          console.log(
            'Log Code',
            logCode,
            ' | ' + `${eccBCC} api:`,
            eval('`' + api + '`'),
          );
          let response = await getData(
            eval('`' + api + '`'), // return data contains email column
            null,
            'json',
            null,
            'GET',
            headers,
          );
          if (response.data.length) {
            let resp = response.data; // eg. {name:"",phone:""...}[]
            console.log('Log Code', logCode, ' | ' + `resp of ${eccBCC}`, resp);
            console.log(
              'Log Code',
              logCode,
              ' | ' + `${eccBCC} in emailRecord`,
              emailRecords[eccBCC],
            );
            let emailColumns = emailRecords[eccBCC].map(
              (clm) => clm.emailColumn,
            );
            console.log(
              'Log Code',
              logCode,
              ' | ' + `column of ${eccBCC}`,
              emailColumns,
            );
            let emails = [];
            emailColumns.forEach((clms) => {
              emails = [...emails, ...resp.map((ele) => ele[clms])];
            });
            console.log(
              'Log Code',
              logCode,
              ' | ' + `emails of ${eccBCC}`,
              emails,
            );
            emails.forEach((e) => {
              ccBccObj[eccBCC].push(e);
            });
          } else {
            throw new Error('No response from api of email');
          }
        }
      }
      if (emailRecords.sending_order === 'ONE_BY_ONE') {
        emailPayload = emailPayload.map((ele) => ({ ...ele, ...ccBccObj }));
      } else if (emailRecords.sending_order === 'ALL_AT_ONCE') {
        let templateResp = await renderTemplateService(
          emailRecords.template_code,
          payload[0],
        );
        emailPayload[0] = { ...emailPayload[0], ...templateResp, ...ccBccObj };
      }
    }
    console.log('emails payload in emailByAPI==>', emailPayload);
    sendingEmails(emailPayload, logCode, workflowBasicCode);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Email by API",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  if (errorInNoResponse.length) {
    logEntry.error_log = JSON.stringify(errorInNoResponse);
  }
  exports.workflowLogEntry(logEntry);
  return emailPayload;
}

async function emailByVariable(
  emailRecords,
  payload,
  logCode,
  workflowBasicCode,
) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Action email, call type variable',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  let emailPayload = [];
  let ccBccObj = { cc: [], bcc: [] }; // cc, bcc will be same for all
  try {
    // to Emails
    for (let obj of payload) {
      let newObj = JSON.parse(JSON.stringify(obj));
      let isColumnMapExecuted = false;
      if (emailRecords.sending_order === 'ONE_BY_ONE') {
        let emailContent = { to: [], subject: '', body: '' };
        let templateResp = await renderTemplateService(
          emailRecords.template_code,
          obj,
        );
        for (let to of emailRecords.to) {
          let viewName = to.split('.')[0];
          if (!isColumnMapExecuted) {
            await columnMappingService(newObj[viewName], {
              latest_user: 'email',
            });
            isColumnMapExecuted = true;
          }
          emailContent.to.push(eval(`newObj.${to}`));
          emailContent = { ...emailContent, ...templateResp };
          emailPayload.push(emailContent);
          emailContent = { to: [], subject: '', body: '' };
        }
      } else if (emailRecords.sending_order === 'ALL_AT_ONCE') {
        for (let to of emailRecords.to) {
          let viewName = to.split('.')[0];
          if (!isColumnMapExecuted) {
            await columnMappingService(newObj[viewName], {
              latest_user: 'email',
            });
            isColumnMapExecuted = true;
          }
          if (!emailPayload.length) {
            emailPayload.push({ to: [eval(`newObj.${to}`)] });
          } else {
            emailPayload[0].to.push(eval(`newObj.${to}`));
          }
        }
      }
    }
    console.log('Log Code', logCode, ' | emailArr', emailPayload);
    // CC, bcc Emails
    for (let obj of payload) {
      let newObj = JSON.parse(JSON.stringify(obj));
      let isColumnMapExecuted = false;
      for (let ec of Object.keys(ccBccObj)) {
        for (let er of emailRecords[ec]) {
          let viewName = er.split('.')[0];
          if (!isColumnMapExecuted) {
            await columnMappingService(newObj[viewName], {
              latest_user: 'email',
            });
            isColumnMapExecuted = true;
          }
          ccBccObj[ec].push(eval(`newObj.${er}`));
        }
      }
    }
    if (emailRecords.sending_order === 'ONE_BY_ONE') {
      emailPayload = emailPayload.map((ele) => ({ ...ele, ...ccBccObj }));
    } else if (emailRecords.sending_order === 'ALL_AT_ONCE') {
      let templateResp = await renderTemplateService(
        emailRecords.template_code,
        payload[0],
      );
      emailPayload[0] = { ...emailPayload[0], ...templateResp, ...ccBccObj };
    }
    sendingEmails(emailPayload, logCode, workflowBasicCode);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Email by variable",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function emailByEmailAddress(
  emailRecords,
  payload,
  logCode,
  workflowBasicCode,
) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Action email, call type email address',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  let emailPayload = [];
  try {
    // Subject and body
    let templateResp = await renderTemplateService(
      emailRecords.template_code,
      payload[0],
    );
    // To email
    if (emailRecords.sending_order === 'ONE_BY_ONE') {
      emailRecords.to.forEach((toEmail, index) => {
        emailPayload[index] = {
          to: [toEmail],
          ...templateResp,
          cc: emailRecords.cc,
          bcc: emailRecords.bcc,
        }; // cc, bcc emails are handling here too.
      });
    } else if (emailRecords.sending_order === 'ALL_AT_ONCE') {
      emailPayload[0] = {
        to: emailRecords.to,
        ...templateResp,
        cc: emailRecords.cc,
        bcc: emailRecords.bcc,
      };
    }
    sendingEmails(emailPayload, logCode, workflowBasicCode);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Email by address",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function actionEmail(actionCode, payload, logCode, workflowBasicCode) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Action email, call type selection',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  let emailsArr = []; // variable for email content template
  try {
    let emailRecords = (
      await getRecords(
        'latest_workflow_action_email',
        `where workflow_action_code="${actionCode}"`,
      )
    )[0];
    if (!emailRecords) {
      console.log(
        'Log Code',
        logCode,
        ' | No email record found for action code:',
        actionCode,
      );
      throw new Error('No email record found');
    }
    console.log('Log Code', logCode, ' | email record:', emailRecords);
    console.log(
      'Log Code',
      logCode,
      ' | email current incomming payload:',
      payload,
    );
    switch (emailRecords.call_type) {
      case 'API':
        emailByAPI(emailRecords, payload, logCode, workflowBasicCode);
        break;
      case 'VARIABLE':
        emailByVariable(emailRecords, payload, logCode, workflowBasicCode);
        break;
      case 'SQL':
        break;
      case 'EMAIL_ADDRESS':
        emailByEmailAddress(emailRecords, payload, logCode, workflowBasicCode);
        break;
    }
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Action Email",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function workflowAction(
  workflowBasicCode,
  workflowConditionCode,
  payload,
  logCode,
) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Action selection',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasicCode,
  };
  try {
    let actionRecords = await getRecords(
      'latest_workflow_action',
      `where workflow_basic_code="${workflowBasicCode}" and workflow_condition_code="${workflowConditionCode}"`,
    );
    if (!actionRecords.length) {
      console.log(
        'Log Code',
        logCode,
        ' | No action is found for this workflow code:',
        workflowBasicCode,
      );
      throw new Error(
        `No action is found for this workflow code: ${workflowBasicCode}`,
      );
    }
    console.log('Log Code', logCode, ' | Actions:', actionRecords);
    actionRecords.forEach((ele) => {
      switch (ele.action_type) {
        case 'EMAIL':
          actionEmail(
            ele.workflow_action_code,
            payload,
            logCode,
            workflowBasicCode,
          );
          break;
        case 'SMS':
          break;
        case 'WHATSAPP':
          break;
        case 'MODIFICATION':
          break;
      }
    });
  } catch (err) {
    logEntry.status = 'FAILEDED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Action",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function createCondition(workflowBasic, payload, logCode) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Create condition',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasic.workflow_basic_code,
  };

  try {
    let conditions = await getRecords(
      'latest_workflow_condition',
      `where workflow_basic_code="${workflowBasic.workflow_basic_code}" AND status="ACTIVE"`,
    );

    if (!conditions || !conditions.length) {
      throw new Error(`No condition is set.`);
    }

    console.log('conditions', conditions);

    for (let con of conditions) {
      let payloads = {};
      let variables = [];
      console.log('Log Code', con.condition_variables);

      con.condition_variables.forEach((ele) => {
        let v = ele.split('.');
        payloads[v[0]] = {
          ...payload.no_changed_column,
          [payload.identifier.column_name]: payload.identifier.column_value,
        };
        variables.push(v[1]);
      });
      let conditionString = generateConditionString(
        [{ or: [...con.conditions] }],
        'NODE',
      )[0];
      console.log('conditionString', conditionString);

      console.log(
        'Log Code ',
        logCode,
        ' | Condition before replace:',
        conditionString,
      );
      let validate = evaluateConditionWithPayload(conditionString, payloads);
      console.log(
        'Log Code ',
        logCode,
        ' | Condition from replace:',
        validate.condition,
        'isValid:',
        validate,
      );
      if (validate) {
        // console.log("workflow action payloads",payloads)
        workflowAction(
          workflowBasic.workflow_basic_code,
          con.workflow_condition_code,
          [payloads],
          logCode,
        );
      } else {
        // throw new Error(`Condition statatement False: ${validate.condition}`);
        logEntry['status'] = 'FALSE';
        logEntry['error_log'] =
          `Condition statatement False: ${validate.condition}`;
      }
    }
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Create Condition",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

async function updateCondition(workflowBasic, payload, logCode) {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Update condition',
    status: 'SUCCESS',
    error_log: null,
    workflow_basic_code: workflowBasic.workflow_basic_code,
  };
  try {
    console.log(
      'Log Code ',
      logCode,
      ' | Workflow basic in update action:',
      workflowBasic,
    );

    // console.log("workflowBasic",workflowBasic.conditions);

    let conditions = await getRecords(
      'latest_workflow_condition',
      `where workflow_basic_code="${workflowBasic.workflow_basic_code}" AND status="ACTIVE"`,
    );
    if (!conditions.length) {
      console.log(
        'Log Code',
        logCode,
        ' | No condition found for workflow code:',
        workflowBasic.workflow_basic_code,
      );
      throw new Error(`No condition is set.`);
      // logEntry["status"]="MISSING";
      // logEntry["error_log"]="No condition found for workflow code: "+workflowBasic.workflow_basic_code;
    }
    for (let con of conditions) {
      let payloads = {};
      let changedVariables = {};
      let variables = [];
      let viewsTableVariable = [];
      con.condition_variables.forEach((ele) => {
        let v = ele.split('.');
        payloads[v[0]] = payload.changed_column;
        changedVariables[v[0]] = { ...payload.changed_column };
        Object.keys(payload.no_changed_column).forEach((ncc) => {
          changedVariables[v[0]][ncc] = {
            old_value: payload.no_changed_column[ncc],
            new_value: payload.no_changed_column[ncc],
          };
        });
        if (!viewsTableVariable.includes(v[0])) viewsTableVariable.push(v[0]);
        // If track any changes
        if (v[1].includes('*')) {
          Object.keys(payload.changed_column).forEach((pcc) => {
            variables.push(pcc);
          });
        } else {
          variables.push(v[1]);
        }
      });
      let isValid;
      let conditionString;
      let conditionStringValue;
      if (con.condition_variables.some((cv) => cv.includes('*'))) {
        isValid = true;
      } else {
        conditionString = generateConditionString(
          [{ or: [...con.conditions] }],
          'NODE',
        )[0];
        console.log(
          'Log Code',
          logCode,
          ' | Condition before replace:',
          conditionString,
        );
        let validate = evaluateConditionWithPayload(
          conditionString,
          changedVariables,
        );
        console.log(
          'Log Code',
          logCode,
          ' |Condition from replace:',
          validate.condition,
          'isValid:',
          validate,
        );
        isValid = validate;
        conditionStringValue = validate.condition;
      }
      if (isValid) {
        payloads.track_changes = {};
        Object.keys(payload.changed_column).forEach((ele) => {
          // payloads[ele]=payload.changed_column[ele].new_value;
          if (variables.includes(ele)) {
            payloads.track_changes = {
              ...payloads.track_changes,
              [ele]: payload.changed_column[ele],
            };
          }
        });
        viewsTableVariable.forEach((ele) => {
          let val = {};
          Object.keys(payloads[ele]).forEach((vv) => {
            val[vv] = payloads[ele][vv].new_value;
          });
          payloads[ele] = {
            [payload.identifier.column_name]: payload.identifier.column_value,
            ...val,
            ...payload.no_changed_column,
          };
        });
        workflowAction(
          workflowBasic.workflow_basic_code,
          con.workflow_condition_code,
          [payloads],
          logCode,
        );
      } else {
        // throw new Error(`Condition statatement False: ${conditionString} => ${conditionStringValue}`);
        logEntry['status'] = 'FALSE';
        logEntry['error_log'] =
          `Condition statatement False: ${conditionString} => ${conditionStringValue}`;
      }
    }
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error_log = err?.stack || err;
    // errorLoggingTicketRaise(err,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow Update Condition",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  exports.workflowLogEntry(logEntry);
}

/**
 * Workflow
 * @param {string} view_name View of the table.
 * @param {{}} data request body payload.
 * @param {string[]} identifier linkage column or primary column.
 */
exports.workflowService = async (workflowBasic, payload, logCode) => {
  const logEntry = {
    workflow_logs_code: logCode,
    step_name: 'Basic select real time type',
    status: 'SUCCESS',
    error_log: null,
  };
  try {
    let workBasic = [];
    switch (payload.upsert_type) {
      case 'CREATE':
        workBasic = workflowBasic.filter(
          (ele) => ele.real_time_type.toUpperCase() === 'CREATE',
        );
        workBasic.forEach((ele) => createCondition(ele, payload, logCode));
        if (!workBasic.length)
          // throw new Error(`No create condition found.`);
          logEntry['status'] = 'MISSING';
        logEntry['error_log'] = 'No create condition found.';
        break;
      case 'UPDATE':
        workBasic = workflowBasic.filter(
          (ele) => ele.real_time_type.toUpperCase() === 'SELF_CHANGES',
        );
        workBasic.forEach((ele) => updateCondition(ele, payload, logCode));
        if (!workBasic.length)
          // throw new Error(`No update condition found.`);
          logEntry['status'] = 'MISSING';
        logEntry['error_log'] = 'No update condition found.';
        break;
    }
  } catch (e) {
    logEntry.error_log = e?.stack || e;
    logEntry.status = 'FAILEDED';
    // errorLoggingTicketRaise(e,{
    //   module_name:"Workflow",
    //   sub_module_name:"Workflow real time type",
    //   record_linkage_column:"workflow_log_code",
    //   record_code_or_id:logCode,
    //   table_name:"workflow_logs",
    // },false,true);
  }
  this.workflowLogEntry(logEntry);
};

exports.allWorkflowCronConditions = async (workflowBasicCode) => {
  let conditions = await getRecords(
    'latest_workflow_condition',
    `where workflow_basic_code="${workflowBasicCode}" and status="ACTIVE"`,
  );
  console.log(
    'cron conditions for workflow Code:',
    workflowBasicCode,
    '=> ',
    conditions,
  );
  for (let con of conditions) {
    let response = await dbRequest(con.sql_statement);
    console.log('cron response:', response);
    let logCode = generateCode({ length: 6 });
    console.log('cron workflowLogCode==>', logCode);
    if (response.length)
      workflowAction(
        workflowBasicCode,
        con.workflow_condition_code,
        response,
        logCode,
      );
  }
};
