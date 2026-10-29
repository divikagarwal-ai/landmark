const {
  getCountRecord,
  getRecords,
  insertRecords,
  isRecordExist,
  filterFunctionality,
  pagination,
  advanceFiltering,
  handleAuditColumns,
  isEditAccess,
  roleFilterService,
} = require('../../utils/dbFunctions');
//   const {
//     getUserProfileWithEveryIdUSerCode,
//   } = require("../services/user.service");
const {
  responser,
  generateCode,
  throwError,
  setDateTimeFormat,
  deleteKeyValuePair,
  getData,
  removeNullValueKey,
} = require('../../utils/helperFunction');
const moment = require('moment');
const {
  workflowService,
  allWorkflowCronConditions,
  workflowLogEntry,
} = require('./workflow.service');
const { cronJob } = require('../../utils/cronJobs');
const { base_url } = require('../../config/server.config');
const { v4 } = require('uuid');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');

exports.upsertWorkflowBasic = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  await isEditAccess('latest_workflow_basic', req.user);

  req.body.module_name = req.body.module_name.toUpperCase();

  if (!req.body.workflow_basic_uuid) {
    let isExist = await isRecordExist(
      'workflow_basic',
      ['module_name'],
      [req.body.module_name],
    );
    if (isExist) {
      return throwError(406, 'Workflow with this module name already exists.');
    }

    req.body.workflow_basic_uuid = v4();
    req.body.workflow_basic_code = generateCode();

    if (req.body.run_as === 'CRON') {
      req.body.cron_code = generateCode({ length: 32 });
    }
  } else {
    oldRecord = (
      await getRecords(
        'latest_workflow_basic',
        filterFunctionality({
          workflow_basic_uuid: req.body.workflow_basic_uuid,
        }),
      )
    )[0];
    if (!oldRecord) return throwError(406, 'Invalid workflow basic uuid.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  await handleAuditColumns('latest_workflow_basic', req.body, [
    'workflow_basic_uuid',
  ]);

  // Prepare data for insert/update
  let data = {
    workflow_basic_uuid: req.body.workflow_basic_uuid,
    workflow_basic_code: req.body.workflow_basic_code || generateCode(),
    module_name: req.body.module_name.toUpperCase(),
    run_as: req.body.run_as,
    cron_code: req.body.run_as === 'CRON' ? generateCode({ length: 32 }) : null,
    cron_schedule_at: req.body.cron_schedule_at,
    status: req.body.status,
    create_ts: setDateTimeFormat('timestemp'),
    // Include other fields from req.body as needed
    ...req.body,
  };

  // Start Cron if needed
  if (req.body.run_as === 'CRON') {
    cronJob(req.body.cron_code, {
      scheduler: req.body.cron_schedule_at,
      callBack: () => allWorkflowCronConditions(req.body.workflow_basic_code),
      status: req.body.status,
    });
  }

  const result = await insertRecords('workflow_basic', data);

  res.json(
    responser(
      `Workflow Definition has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      data,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: data,
    },
    'workflow_basic',
    'workflow_basic_uuid',
    'workflow',
    result.insertId,
    // req.user,
  );
};

exports.getWorkflowBasic = async (req, res) => {
  const tableName = 'latest_workflow_basic';
  let {
    workflow_basic_code,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    pageLimit,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      workflow_basic_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  // filter = await roleFilterService(
  //   filter,
  //   tableName,
  //   req.user
  // );
  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  // let totalRecords = await getCountRecord(tableName, filter);

  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Latest Workflow basic',
      result,
      result.length,
      // totalRecords
    ),
  );
};

exports.upsertWorkflowCondition = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.workflow_condition_uuid) {
    let isExist = await isRecordExist(
      'workflow_condition',
      ['workflow_condition_code'],
      [req.body.workflow_condition_code],
    );
    if (isExist) {
      return throwError(406, 'Workflow condition already exists.');
    }

    req.body.workflow_condition_uuid = v4();
    req.body.workflow_condition_code = generateCode({ length: 6 });
  } else {
    oldRecord = (
      await getRecords(
        'workflow_condition',
        filterFunctionality({
          workflow_condition_uuid: req.body.workflow_condition_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Workflow condition.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  let workflowBasic = (
    await getRecords(
      'latest_workflow_basic',
      `where workflow_basic_code="${req.body.workflow_basic_code}"`,
    )
  )[0];
  if (!workflowBasic) throwError(400, 'Invalid workflow Basic');

  await handleAuditColumns('latest_workflow_condition', req.body, [
    'workflow_condition_uuid',
  ]);
  const result = await insertRecords('workflow_condition', req.body);

  res.json(
    responser(
      `Workflow condition has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'workflow_condition',
    'workflow_condition_uuid',
    'workflow',
    result.insertId,
    req.user,
  );
};
exports.getWorkflowCondition = async (req, res) => {
  const tableName = 'latest_workflow_condition';
  let {
    workflow_condition_uuid,
    workflow_condition_code,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      workflow_condition_uuid,
      workflow_condition_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'latest_workflow_basic', req.user);
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  let pageFilter = pagination(pageNo, itemPerPage);
  // let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Latest Workflow Condition', result, result.length),
  );
};

exports.upsertWorkflowAction = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.workflow_action_uuid) {
    let isExist = await isRecordExist(
      'workflow_action',
      ['workflow_action_code'],
      [req.body.workflow_action_code],
    );
    if (isExist) {
      return throwError(406, 'Workflow action already exists.');
    }

    req.body.workflow_action_uuid = v4();
    req.body.workflow_action_code = generateCode();
  } else {
    oldRecord = (
      await getRecords(
        'workflow_action',
        filterFunctionality({
          workflow_action_uuid: req.body.workflow_action_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Workflow action.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  let workflowBasic = (
    await getRecords(
      'latest_workflow_basic',
      `where workflow_basic_code="${req.body.workflow_basic_code}"`,
    )
  )[0];
  if (!workflowBasic) throwError(400, 'Invalid workflow Basic');

  await handleAuditColumns('latest_workflow_action', req.body, [
    'workflow_action_uuid',
  ]);
  const result = await insertRecords('workflow_action', req.body);

  res.json(
    responser(
      `Workflow action has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'workflow_action',
    'workflow_action_uuid',
    'workflow',
    result.insertId,
    req.user,
  );
};
exports.getWorkflowAction = async (req, res) => {
  const tableName = 'latest_workflow_action';
  let {
    workflow_action_uuid,
    workflow_action_code,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      workflow_action_uuid,
      workflow_action_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'latest_workflow_basic', req.user);
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Latest Workflow Action', result, result.length, totalRecords),
  );
};

exports.upsertWorkflowActionEmail = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.workflow_action_email_uuid) {
    let isExist = await isRecordExist(
      'workflow_action_email',
      ['workflow_action_email_code'],
      [req.body.workflow_action_email_code],
    );
    if (isExist) {
      return throwError(406, 'Workflow action email already exists.');
    }

    req.body.workflow_action_email_uuid = v4();
    req.body.workflow_action_email_code = generateCode();
  } else {
    oldRecord = (
      await getRecords(
        'workflow_action_email',
        filterFunctionality({
          workflow_action_email_uuid: req.body.workflow_action_email_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Workflow action email.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  let workflowBasic = (
    await getRecords(
      'latest_workflow_basic',
      `where workflow_basic_code="${req.body.workflow_basic_code}"`,
    )
  )[0];
  if (!workflowBasic) throwError(400, 'Invalid workflow Basic');

  await handleAuditColumns('latest_workflow_action_email', req.body, [
    'workflow_action_email_uuid',
  ]);
  const result = await insertRecords('workflow_action_email', req.body);

  res.json(
    responser(
      `Workflow action email has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'workflow_action_email',
    'workflow_action_email_uuid',
    'workflow',
    result.insertId,
    req.user,
  );
};

exports.getWorkflowActionEmail = async (req, res) => {
  const tableName = 'latest_workflow_action_email';
  let {
    workflow_action_email_uuid,
    workflow_action_email_code,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      workflow_action_email_uuid,
      workflow_action_email_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'latest_workflow_basic', req.user);
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Latest Workflow Action Email',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.upsertWorkflowActionMessage = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.workflow_action_message_uuid) {
    let isExist = await isRecordExist(
      'workflow_action_message',
      ['workflow_action_message_code'],
      [req.body.workflow_action_message_code],
    );
    if (isExist) {
      return throwError(406, 'Workflow action message already exists.');
    }

    req.body.workflow_action_message_uuid = v4();
    req.body.workflow_action_message_code = generateCode();
  } else {
    oldRecord = (
      await getRecords(
        'workflow_action_message',
        filterFunctionality({
          workflow_action_message_uuid: req.body.workflow_action_message_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Workflow action message.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  let workflowBasic = (
    await getRecords(
      'latest_workflow_basic',
      `where workflow_basic_code="${req.body.workflow_basic_code}"`,
    )
  )[0];
  if (!workflowBasic) throwError(400, 'Invalid workflow Basic');

  await handleAuditColumns('latest_workflow_action_message', req.body, [
    'workflow_action_message_uuid',
  ]);
  const result = await insertRecords('workflow_action_message', req.body);

  res.json(
    responser(
      `Workflow action message has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'workflow_action_message',
    'workflow_action_message_uuid',
    'workflow',
    result.insertId,
    req.user,
  );
};
exports.getWorkflowActionMessage = async (req, res) => {
  const tableName = 'latest_workflow_action_message';
  let {
    workflow_action_message_uuid,
    workflow_action_message_code,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      workflow_action_message_uuid,
      workflow_action_message_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'latest_workflow_basic', req.user);
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Latest Workflow Action Message',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.getAllWorkflowDefinition = async (req, res) => {
  // await isViewAccess("latest_workflow_basic",req.user);
  const { workflow_basic_code } = req.query;
  let workflowAllDefinition = {};
  workflowAllDefinition.workflowBasic = await getRecords(
    'latest_workflow_basic',
    `where workflow_basic_code="${workflow_basic_code}"`,
  );
  workflowAllDefinition.workflowConditions = await getRecords(
    'latest_workflow_condition',
    `where workflow_basic_code="${workflow_basic_code}"`,
  );
  workflowAllDefinition.workflowActions = await getRecords(
    'latest_workflow_action',
    `where workflow_basic_code="${workflow_basic_code}"`,
  );
  workflowAllDefinition.workflowEmails = await getRecords(
    'latest_workflow_action_email',
    `where workflow_basic_code="${workflow_basic_code}"`,
  );
  res.json(
    responser('Workflow All definition', [
      ...workflowAllDefinition.workflowBasic,
      ...workflowAllDefinition.workflowConditions,
      ...workflowAllDefinition.workflowActions,
      ...workflowAllDefinition.workflowEmails,
    ]),
  );
};

exports.workflowInitiate = async (req, res) => {
  try {
    const { endpoint_path, upsert_type } = req.body;
    if (!endpoint_path) {
      return throwError(400, 'Endpoint path is required');
    }

    const payload = {
      endpoint_path,
      trigger_action: upsert_type,
      step_name: 'Inititation',
      status: 'SUCCESS',
      error_log: null,
    };

    // Ensure no_changed_column exists and has the required properties
    req.body.no_changed_column = {
      ...(req.body.no_changed_column || {}),
      created_by_uuid: req.body.created_by_uuid,
      modified_by_uuid: req.body.modified_by_uuid,
    };

    let workflowBasics = await getRecords(
      'latest_workflow_basic',
      `where endpoint_path is not NULL AND endpoint_path="${endpoint_path}" AND status="ACTIVE"`,
    );

    if (!workflowBasics || !workflowBasics.length) {
      payload.error_log = 'No workflow found for endpoint: ' + endpoint_path;
      payload.status = 'FAILED';
      await workflowLogEntry(payload);
      return throwError(204, 'No workflow found');
    }

    let logCode = await workflowLogEntry(payload);
    await workflowService(workflowBasics, req.body, logCode.workflow_logs_code);

    res.json(responser('Workflow initiated successfully.'));
  } catch (error) {
    // Log the error for debugging
    console.error('Workflow initiation error:', error);

    // Send appropriate error response
    return throwError(
      error.status || 500,
      error.message || 'Error initiating workflow',
    );
  }
};
