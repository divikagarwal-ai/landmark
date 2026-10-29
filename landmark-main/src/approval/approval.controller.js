const {
  insertRecords,
  getRecords,
  getTableColumnsNames,
  isValidRecord,
  filterFunctionality,
  pagination,
  dbRequest,
  roleFilterService,
  insertRecordHandleIncremental,
  isTableOrViewExist,
  getCountRecord,
  isColumnExistInTable,
} = require('../../utils/dbFunctions');
const {
  removeNullValueKey,
  throwError,
  responser,
  getData,
  setDateTimeFormat,
  deleteKeyValuePair,
} = require('../../utils/helperFunction');
const { v4: uuidv4 } = require('uuid');
const { base_url } = require('../../config/server.config');
const tableMap = require('./tablemapping.json');
const { approvalEmails } = require('../../utils/microservice_func');

exports.insertApproval = async (req, res) => {
  removeNullValueKey(req.body);
  let columns = await getTableColumnsNames(
    tableMap[req.body.table_name] || req.body.table_name,
  );
  if (!columns.includes(req.body.record_column_name))
    throwError(
      400,
      `Table does not have ${req.body.record_column_name} column`,
    );
  let approvalRecordInfo = (
    await getRecords(
      tableMap[req.body.table_name] || req.body.table_name,
      `where ${req.body.record_column_name}='${req.body.record_uuid}'`,
    )
  )[0];
  if (!approvalRecordInfo)
    throwError(404, 'ApprovalRecordInfo not found and access cannot be given.');

  const approvalCount = (
    await getRecords(
      'latest_approval_count',
      `where table_name="${req.body.table_name}" and approval_raise_status="${approvalRecordInfo.status}"
      and status="ACTIVE"`,
    )
  )[0];

  if (!approvalCount) {
    return res
      .status(200)
      .json(responser(`No approval for this status : ${req.body.status}`));
  }

  req.body = {
    ...req.body,
    approval_uuid: uuidv4(),
    requested_by_uuid: req.user.user_uuid,
    current_level: 1,
    create_ts: setDateTimeFormat('timestamp'),
    approval_uuids: approvalCount.approval_hierarchy[0],
    previous_status: approvalCount.previous_status,
    status: 'REQUESTED',
    next_status: approvalCount.next_status,
  };
  await insertRecords('approval', req.body);
  res.status(200).json(responser('Approval inserted successfully', req.body));

  // <------------ Send Email On Action ------------->
  approvalEmails(req.body.approval_uuid, req.user);
};

exports.handleApproval = async (req, res) => {
  removeNullValueKey(req.body);
  let recordStatus = '';
  let approved_flag = 'NO';
  let approval = await getRecords(
    'latest_approval',
    `where approval_uuid = '${req.body.approval_uuid}'`,
  );
  if (!approval.length) throwError('Approval not found', 404);
  if (
    !approval[0].approval_uuids.some(
      (ele) =>
        ele.uuid === req.user.user_uuid ||
        ele.uuid === req.user.role_uuid ||
        req.user.role_value === 'ADMIN',
    ) &&
    req.body.status !== 'ROLLBACK'
  )
    throwError(400, 'Invalid approver.');
  let userInfo = (
    await getRecords(
      'latest_user',
      `where user_uuid = '${req.user.user_uuid}' AND status="ACTIVE"`,
      null,
      ['first_name', 'last_name'],
    )
  )[0];
  if (!userInfo) throwError(400, 'Invalid user');
  let record = await getRecords(
    tableMap[approval[0].table_name] || approval[0].table_name,
    `where ${approval[0].record_column_name} = '${approval[0].record_uuid}'`,
  );
  if (!record.length) throwError('Record not found', 404);
  let approvalCount = (
    await getRecords(
      'latest_approval_count',
      `where table_name="${approval[0].table_name}"
      and approval_raise_status="${record[0].status}" and status="ACTIVE"`,
    )
  )[0];
  if (!approvalCount) throwError(400, 'Invalid table for approval count');
  if (req.body.status === 'APPROVED') {
    recordStatus = approval[0].next_status;
    approved_flag = 'YES';
  } else recordStatus = approval[0].previous_status;
  //  status change in corresponding table.
  if (
    approvalCount.level === approval[0].current_level ||
    req.body.status === 'REJECTED' ||
    req.body.status === 'ROLLBACK'
  ) {
    if (approvalCount.link_table) {
      let linkRecord = await getRecords(
        approvalCount.link_table,
        `where ${approvalCount.link_column} = '${record[0][approvalCount.link_column]}'`,
      );
      if (linkRecord.length) {
        await insertRecords(approvalCount.link_table.replace('latest_', ''), {
          ...linkRecord[0],
          status: recordStatus,
        });
      }
    }

    if (!req.body.fields) req.body.fields = {};
    await insertRecords(
      (tableMap[approval[0].table_name] || approval[0].table_name).replace(
        'latest_',
        '',
      ),
      {
        ...record[0],
        approved_flag,
        approved_by_uuid: req.user.user_uuid,
        approved_by_name:
          userInfo.first_name + userInfo.last_name
            ? ' ' + userInfo.last_name
            : '',
        status: recordStatus,
        ...req.body.fields,
        approval_date: setDateTimeFormat('timestamp'),
      },
    );
  } else {
    await insertRecords(
      (tableMap[approval[0].table_name] || approval[0].table_name).replace(
        'latest_',
        '',
      ),
      {
        ...record[0],
        ...req.body.fields,
      },
    );
  }
  req.body = { ...approval[0], ...req.body };
  await insertRecords('approval', req.body);
  if (
    approvalCount.level !== approval[0].current_level &&
    req.body.status === 'APPROVED'
  ) {
    approval[0].approval_uuids =
      approvalCount.approval_hierarchy[approval[0].current_level];
    approval[0].current_level += 1;
    approval[0].status = 'REQUESTED';
    approval[0].created_by_uuid = req.user.user_uuid;
    await insertRecords('approval', approval[0]);
  } else {
    const bodyData = {
      table_name: approval[0].table_name,
      record_uuid: approval[0].record_uuid,
      record_column_name: approval[0].record_column_name,
    };
    await getData(
      base_url + '/api/v1/approval/insert-approval',
      null,
      'json',
      bodyData,
      'POST',
      req.headers,
    );
  }
  let msg = '';
  switch (req.body.status) {
    case 'APPROVED':
      msg = 'Approved successfully';
      break;
    case 'REJECTED':
      msg = 'Rejected successfully';
      break;
    case 'ROLLBACK':
      msg = 'Rollback successfully';
      break;
  }
  if (req.body.remark) {
    let parent_module_no = '';
    //Add approval modules here in the list. First module found will be used as parent module.
    let module_names = ['product_code', 'order_no', 'enquiry_no'];

    for (let element of module_names) {
      if (record[0].hasOwnProperty(element)) {
        parent_module_no = record[0][element];
        break;
      }
    }
    const bodyData = {
      parent_module_no: parent_module_no,
      module_uuid: req.body.approval_uuid,
      module_name: 'APPROVAL',
      comment_remark: req.body.remark,
      status: 'ACTIVE',
      created_by_name: req.user.first_name + ' ' + req.user.last_name,
      created_by_uuid: req.body.created_by_uuid,
    };

    getData(
      base_url + '/api/v1/comment/upsert-comment',
      null,
      'json',
      bodyData,
      'POST',
      req.headers,
    );
  }
  res.status(200).json(responser(msg, req.body));
  // <------------ Send Email On Action ------------->
  approvalEmails(req.body.approval_uuid, req.user);
};

exports.getApprovals = async (req, res) => {
  const {
    table_name,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_approval';
  let filter = filterFunctionality(
    {
      table_name,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
    {
      alias: 'la',
    },
  );
  if (req.user.role_value !== 'ADMIN') {
    filter =
      (filter ? `${filter} AND ` : 'WHERE ') +
      `(JSON_CONTAINS(approval_uuids, '{"type": "USER", "uuid": "${req.user.user_uuid}"}')
    or JSON_CONTAINS(approval_uuids, '{"type": "ROLE", "uuid": "${req.user.role_uuid}"}'))`;
  }
  console.log('filter after filter', filter);
  let pageFilter = pagination(pageNo, itemPerPage);
  let result = (
    await dbRequest(`select record_column_name from latest_approval 
                  where table_name='${table_name}' limit 1;`)
  )[0];
  let resultJoined = [];
  if (result) {
    filter = await roleFilterService(
      filter,
      tableMap[table_name] || table_name,
      req.user,
      {
        alias: 'at.',
      },
    );
    resultJoined =
      await dbRequest(`SELECT at.*, la.approval_uuid, la.requested_by_uuid, la.status as approval_status FROM latest_approval la
    INNER JOIN ${tableMap[table_name] || table_name} at ON record_uuid = ${
      result.record_column_name
    } and at.status LIKE "%_APPROVAL_REQUESTED" ${filter} ${pageFilter}`);
    // resultJoined =
    //   await dbRequest(`SELECT at.*, la.approval_uuid, la.requested_by_uuid, la.status as approval_status FROM latest_approval la
    // INNER JOIN ${tableMap[table_name] || table_name} at ON record_uuid = ${
    //   result.record_column_name
    // } and at.status = "${table_name
    //   .replace('latest_', '')
    //   .toUpperCase()}_APPROVAL_REQUESTED" ${filter} ${pageFilter}`);
  }
  return res.json(responser('Approvals ', resultJoined, resultJoined.length));
};

exports.insertApprovalCount = async (req, res) => {
  removeNullValueKey(req.body);
  const {
    table_name,
    approval_hierarchy,
    approval_count_uuid,
    link_table,
    link_column,
  } = req.body;
  if (!tableMap[table_name]) {
    let isTableExist = await isTableOrViewExist(table_name);
    if (!isTableExist) throwError(400, 'Invalid Table name');
  }
  if (link_table && link_column) {
    let isColumnExist1 = await isColumnExistInTable(table_name, link_column);
    let isColumnExist2 = await isColumnExistInTable(link_table, link_column);
    if (!isColumnExist1 || !isColumnExist2)
      throwError(400, 'Invalid Column name');
  }
  let promiseArr = [];
  for (let arr of approval_hierarchy) {
    promiseArr.push(
      arr.map((ele) => {
        if (ele.type === 'ROLE') {
          return isValidRecord('latest_roles', {
            role_uuid: ele.uuid,
            status: 'ACTIVE',
          });
        } else {
          return isValidRecord('latest_user', {
            user_uuid: ele.uuid,
            status: 'ACTIVE',
          });
        }
      }),
    );
  }
  for (let j in promiseArr) {
    let respPromise = await Promise.all(promiseArr[j]);
    if (!respPromise.every((i) => i === 1)) {
      let indexOFZero = respPromise.indexOf(0);
      let type = approval_hierarchy[j][indexOFZero].type;
      throwError(
        400,
        `At level ${+j + 1}, invalid ${type} at position ${indexOFZero + 1}`,
      );
    }
  }
  req.body.level = approval_hierarchy.length;
  if (approval_count_uuid) {
    let approvalCount = (
      await getRecords(
        'latest_approval_count',
        `where approval_count_uuid="${approval_count_uuid}"`,
      )
    )[0];
    if (!approvalCount) throwError(400, 'Invalid Approval count for update');
    req.body = { ...approvalCount, ...req.body };
  } else {
    req.body.approval_count_uuid = uuidv4();
    req.body.create_ts = setDateTimeFormat('timestamp');
  }
  await insertRecords('approval_count', req.body);
  // <----------- Insert in Approval immediately too for reflection --------------------->

  let updateApproval = [];
  let currentApprovals = await getRecords(
    'latest_approval',
    `where table_name='${table_name}' and status='REQUESTED'`,
  );
  if (currentApprovals.length) {
    for (let i = 0; i < currentApprovals.length; i++) {
      if (approval_hierarchy[currentApprovals[i].current_level - 1]) {
        currentApprovals[i].approval_uuids =
          approval_hierarchy[currentApprovals[i].current_level - 1];
        updateApproval.push(currentApprovals[i]);
      }
    }
    if (updateApproval.length) await insertRecords('approval', updateApproval);
  }

  res.json(
    responser(`Approval has been set for table ${table_name}`, req.body),
  );
};

exports.getApprovalCount = async (req, res) => {
  const {
    approval_count_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_approval_count';
  let filter = filterFunctionality(
    {
      approval_count_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  // filter = await roleFilterService(filter, 'latest_customer', req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(
    responser('Approval Count list', result, result.length, totalRecords),
  );
};

exports.mergeApprovalWithRecord = async (req, res) => {
  let { record_uuid, table_name, data } = req.body;
  let approvalCount = await getRecords(
    'latest_approval_count',
    `where table_name = "${table_name}" and status = "ACTIVE"`,
  );
  if (!approvalCount.length) {
    res.json(data);
  }
  let approvalRecord = await getRecords(
    'latest_approval',
    `where status='REQUESTED' and table_name='${table_name}' and record_uuid='${record_uuid}'`,
    null,
    ['approval_uuid', 'requested_by_uuid', 'approval_uuids'],
  );
  if (approvalRecord.length) {
    let is_user_approver = approvalRecord[0].approval_uuids.some(
      (ele) =>
        ele.uuid === req.user.user_uuid ||
        ele.uuid === req.user.role_uuid ||
        req.user.role_value === 'ADMIN',
    );
    deleteKeyValuePair(approvalRecord[0], ['approval_uuids']);
    data = { ...data, ...approvalRecord[0], is_user_approver };
  } else {
    let nonApprovalRecord = await getRecords(
      'latest_approval',
      `where (status='REJECTED' OR status='APPROVED') and table_name='${table_name}' and record_uuid='${record_uuid}'`,
      null,
      ['remark'],
    );
    if (nonApprovalRecord.length) {
      data = { ...data, ...nonApprovalRecord[0] };
    }
  }
  res.json(data);
};

exports.getTableStatus = async (req, res) => {
  const { module_name, submodule_name, table_name } = req.query;

  let tableName = 'tables_reference';
  let result = await dbRequest(
    `select * from ${tableName} where module_name='${module_name}'
    and submodule_name='${submodule_name}'
    and table_name='${table_name}'`,
  );
  return res.json(
    responser('All status for the table : ', result, result.length),
  );
};
