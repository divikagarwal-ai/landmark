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
const { base_url } = require('../../config/server.config');

exports.upsertFoodMenu = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.food_menu_uuid) {
    req.body.food_menu_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'latest_food_menu',
        filterFunctionality({
          food_menu_uuid: req.body.food_menu_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Food menu.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  await handleAuditColumns('latest_food_menu', req.body, ['food_menu_uuid']);

  const result = await insertRecords('food_menu', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Food menu has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'food_menu',
    'food_menu_uuid',
    'food_menu',
    result.insertId,
    req.user,
  );
};

exports.getFoodMenu = async (req, res) => {
  const tableName = 'latest_food_menu';
  let {
    food_menu_id,
    food_menu_name,
    food_menu_uuid,
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
      food_menu_id,
      food_menu_uuid,
      food_menu_name,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(responser('Food Menu', result, result.length));
};

exports.addFoodMenuToLead = async (req, res) => {
  removeNullValueKey(req.boby);
  let filter = filterFunctionality({ leads_uuid: req.body.leads_uuid });
  let lead = (await getRecords('latest_leads', filter))[0];
  if (!lead) throwError(400, 'Lead not found.');
  if (lead.contact_number_1) {
    let customer = (
      await getRecords(
        'latest_customer_info',
        filterFunctionality({ email: lead.email }),
      )
    )[0];
    if (customer) req.body.customer_uuid = customer.customer_uuid;
  }
  let oldRecord = (await getRecords('latest_added_lead_food_menu', filter))[0];
  if (oldRecord) {
    req.body = { ...oldRecord, ...req.body };
  }
  await handleAuditColumns('latest_added_lead_food_menu', req.body, [
    'leads_uuid',
  ]);
  let result = await insertRecords('added_lead_food_menu', req.body);
  let booking = (await getRecords('latest_booking', filter))[0];
  if (booking) {
    deleteKeyValuePair(booking, [
      'booking_id',
      'booking_unique_id',
      'create_ts',
      'insert_ts',
    ]);
    await requestApi(
      base_url + '/api/v1/occupancy/booking',
      null,
      'POST',
      {
        'Content-Type': 'application/json',
        'auth-Token': req.user.access_token,
      },
      {
        ...booking,
        food_menu: req.body.food_menu,
      },
    );
  }
  res.json(responser('Food added to the lead.', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'food_menu',
    'food_menu_uuid',
    'food_menu',
    result.insertId,
    req.user,
  );
};
