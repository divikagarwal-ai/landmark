const {
  getCountRecord,
  getRecords,
  insertRecords,
  isRecordExist,
  filterFunctionality,
  pagination,
  handleAuditColumns,
} = require('../../utils/dbFunctions');

const {
  responser,
  removeNullValueKey,
  throwError,
} = require('../../utils/helperFunction');

const { v4 } = require('uuid');
const { saveHistory } = require('../../utils/microservice_func');
const { runCampaignsService } = require('./campaign.service');

exports.upsertCampaign = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  // await isEditAccess('latest_market_campaign', req.user);

  if (!req.body.market_campaign_uuid) {
    let isExist = await isRecordExist(
      'market_campaign',
      ['campaign_name'],
      [req.body.campaign_name],
    );
    if (isExist) {
      return throwError(406, 'Campaign with this name already exists.');
    }

    req.body.market_campaign_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'market_campaign',
        filterFunctionality({
          market_campaign_uuid: req.body.market_campaign_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid campaign.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  await handleAuditColumns('latest_market_campaign', req.body, [
    'market_campaign_uuid',
  ]);
  const result = await insertRecords('market_campaign', req.body);

  res.json(
    responser(
      `Campaign has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'market_campaign',
    'market_campaign_uuid',
    'campaign',
    result.insertId,
    req.user,
  );
};

exports.getCampaigns = async (req, res) => {
  const tableName = 'latest_market_campaign';
  let {
    market_campaign_uuid,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    pageLimit,
    channel_type,
  } = req.query;

  let filter = filterFunctionality(
    { market_campaign_uuid, channel_type },
    status,
    to_date,
    from_date,
  );

  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);

  return res.json(
    responser(
      'Campaigns retrieved successfully',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.runCampaigns = async (req, res) => {
  res.json(responser('Campaigns executed successfully'));
  runCampaignsService();
};
