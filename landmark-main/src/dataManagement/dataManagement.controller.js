const {
  pagination,
  filterFunctionality,
  getCountRecord,
  getRecords,
  insertRecords,
  roleFilterService,
  isEditAccess,
  isValidRecord,
  isRecordExist,
} = require('../../utils/dbFunctions');
const {
  responser,
  removeNullValueKey,
  throwError,
  getData,
  deleteKeyValuePair,
} = require('../../utils/helperFunction');
const { base_url } = require('../../config/server.config');
const { v4: uuidv4 } = require('uuid');
const bycrpt = require('bcrypt');

exports.upsertBranch = async (req, res) => {
  await isEditAccess('latest_branch', req.user);
  removeNullValueKey(req.body);
  req.body.branch_name = req.body.branch_name.toUpperCase();
  let isUpadtion = false;
  if (req.body.branch_uuid) {
    let branch = (
      await getRecords('branch', `where branch_uuid="${req.body.branch_uuid}"`)
    )[0];
    if (!branch) throwError(404, 'Branch not found.');
    console.log('latest_branch', branch);
    isUpadtion = true;
    req.body = { ...branch, ...req.body };
  } else {
    let isExist = await isValidRecord('branch', {
      branch_name: req.body.branch_name,
    });
    if (isExist) throwError(404, 'Branch is already exists.');
    req.body.branch_uuid = uuidv4();
  }
  console.log('check1', req.body);
  await insertRecords('branch', req.body);
  res.json(responser('Branch created  successfully.', req.body));
};
exports.getBranch = async (req, res) => {
  const {
    branch_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;
  let tableName = 'latest_branch';
  let filter = filterFunctionality(
    {
      branch_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(responser('All Branch', result, result.length, totalRecords));
};

exports.upsertZone = async (req, res) => {
  await isEditAccess('latest_zone', req.user);
  removeNullValueKey(req.body);
  let isUpadtion = false;
  req.body.zone_name = req.body.zone_name.toUpperCase();
  if (req.body.zone_uuid) {
    let zone = (
      await getRecords('latest_zone', `where zone_uuid="${req.body.zone_uuid}"`)
    )[0];
    if (!zone) throwError(400, 'Invalid zone');
    isUpadtion = true;
    req.body = { ...zone, ...req.body };
  } else {
    let isExist = await isValidRecord('zone', {
      zone_name: req.body.zone_name,
    });
    if (isExist) throwError(404, 'Zone is already exists.');
    req.body.zone_uuid = uuidv4();
  }
  let zone = await insertRecords('zone', req.body);
  res.json(responser('Zone created  successfully.', req.body));
};

exports.getZone = async (req, res) => {
  const {
    zone_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_zone';
  let filter = filterFunctionality(
    {
      zone_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(responser('All Zone', result, result.length, totalRecords));
};
