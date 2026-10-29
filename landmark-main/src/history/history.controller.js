const {
  pagination,
  filterFunctionality,
  getCountRecord,
  getRecords,
  insertRecords,
  isValidRecord,
} = require('../../utils/dbFunctions');

const {
  responser,
  removeNullValueKey,
  setDateTimeFormat,
  throwError,
  getData,
} = require('../../utils/helperFunction');
const { v4 } = require('uuid');

const uuid = v4;

exports.upsertHistory = async (req, res) => {
  removeNullValueKey(req.body);
  console.log('req body', req.body);
  if (req.body.history_uuid) {
    let history_info = await getRecords(
      'history',
      `where history_uuid='${req.body.history_uuid}'`,
    );
    if (!history_info.length) throwError(404, 'History not found.');
    history_info = history_info[0];
    history_info.create_ts = setDateTimeFormat(
      'timestamp',
      history_info.create_ts,
    );
    req.body = { ...history_info, ...req.body };
  } else {
    req.body.create_ts = setDateTimeFormat('timestamp');
    req.body.history_uuid = uuid();
  }
  await insertRecords('history', req.body);
  res.json(responser('History created successfully.', req.body));
};

exports.getHistory = async (req, res) => {
  const {
    module_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_history';
  let filter = filterFunctionality(
    {
      module_uuid,
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
  return res.json(responser('History ', result, result.length, totalRecords));
};

exports.upsertEmailHistory = async (req, res) => {
  removeNullValueKey(req.body);
  if (req.body.email_history_uuid) {
    let email_history_info = await getRecords(
      'latest_email_history',
      `where email_history_uuid='${req.body.email_history_uuid}'`,
    );
    if (!email_history_info.length)
      throwError(404, 'email_history_info not found.');
    email_history_info = email_history_info[0];
    email_history_info.create_ts = setDateTimeFormat(
      'timestamp',
      email_history_info.create_ts,
    );
    req.body = { ...email_history_info, ...req.body };
  } else {
    if (Array.isArray(req.body)) {
      req.body = req.body.map((item) => ({
        ...item,
        create_ts: setDateTimeFormat('timestamp'),
        email_history_uuid: uuid(),
      }));
    } else {
      req.body.create_ts = setDateTimeFormat('timestamp');
      req.body.email_history_uuid = uuid();
    }
  }
  await insertRecords('email_history', req.body);
  res.json(responser('Email History created successfully.', req.body));
};

exports.getEmailHistory = async (req, res) => {
  const {
    email_history_id,
    email_history_uuid,
    module_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_email_history';
  let filter = filterFunctionality(
    {
      email_history_id,
      email_history_uuid,
      module_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );

  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(
    responser('Email History: ', result, result.length, totalRecords),
  );
};
