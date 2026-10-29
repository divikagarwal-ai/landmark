const {
  getCountRecord,
  getRecords,
  insertRecords,
  isRecordExist,
  dbRequest,
  pagination,
  advanceFiltering,
  filterFunctionality,
  roleFilterService,
  isEditAccess,
  handleHistoryMessage,
  handleAuditColumns,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');
const {
  responser,
  throwError,
  setDateTimeFormat,
  getData,
  deleteKeyValuePair,
  removeNullValueKey,
  requestApi,
} = require('../../utils/helperFunction');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');

const { BASE_URL, base_url } = require('../../config/server.config');

exports.upsertVenue = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.venue_uuid) {
    let isExist = await isRecordExist(
      'venue',
      ['venue_name'],
      [req.body.venue_name],
    );
    if (isExist) {
      return throwError(406, 'Venue already exists.');
    }

    req.body.venue_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'venue',
        filterFunctionality({
          venue_uuid: req.body.venue_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Venue.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_venue', req.body, ['venue_uuid']);
  const result = await insertRecords('venue', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Venue has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'venue',
    'venue_uuid',
    'venue',
    result.insertId,
    req.user,
  );
};

exports.getVenue = async (req, res) => {
  const tableName = 'latest_venue';
  let {
    venue_id,
    venue_name,
    venue_uuid,
    venue_address,
    capacity,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    pageLimit,
    itemPerPage,
    advanceFilter,
  } = req.query;

  let filter = filterFunctionality(
    {
      venue_id,
      venue_name,
      venue_uuid,
      venue_address,
      capacity,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  filter = await roleFilterService(filter, tableName, req.user);
  // let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, null, null, {
    includeUniqueId: false,
  });
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(responser('Venue', result, result.length, totalRecords));
};
