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
  getSystemUserToken,
  listOrderBy,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');
const {
  createLeadService,
  getLeadService,
  settleBookingInLead,
  sendWhatsappTemplatesInLead,
} = require('./leads.service');
const {
  responser,
  //   readFileContent,

  throwError,
  setDateTimeFormat,
  getData,
  deleteKeyValuePair,
  removeNullValueKey,
  requestApi,
  generateCode,
} = require('../../utils/helperFunction');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');
// const { validationCodeMsg } = require('../utils/validationCodeMsg');
const dbService = require('../customer/customer.service');
const moment = require('moment');

const { base_url, webhook } = require('../../config/server.config');
const {
  getEmailBodyByTemplateMapping,
} = require('../template/template.service');
const { getgenai } = require('../../utils/genAifunctions');

exports.createLead = async (req, res) => {
  const isLeadExist = req.body.leads_id;
  // await isEditAccess('latest_lead_without_opportunity_status', req.user);
  let isUpadtion = false;
  let checkStatus;
  req.body.created_by_uuid = null;
  let resp = await createLeadService(req.body, req.user, req.headers);

  res.json(resp);
};

exports.createAuthLead = async (req, res) => {
  await isEditAccess('latest_leads', req.user);
  let customerRecords = (
    await getRecords(
      'customer_fact',
      `where contact_number='${(req.body.contact_number_one.startsWith('+91') ? '' : '+91') + req.body.contact_number_one}'`,
    )
  )[0];

  if (!customerRecords) {
    console.log('Customer not found, creating a new customer...');
    customerRecords = (
      await requestApi(
        base_url + '/api/v1/customer/upsert-customer',
        null,
        'POST',
        {
          'Content-Type': 'application/json',
          'auth-Token': req.user.access_token,
        },
        {
          ...req.body,
          first_name: req.body.name_of_guest,
          contact_number: req.body.contact_number_one,
          status: req.body.status === 'BOOKED' ? 'ACTIVE' : 'PROSPECT',
        },
      )
    ).data;
  }

  // console.log('customer=>', customerRecords);

  req.body.customer_fact_uuid = customerRecords.customer_fact_uuid;
  req.body.customer_name = customerRecords.name_of_guest;
  console.log(req.body.customer_name);
  req.body.status = req.body.status || 'ONGOING';
  // if (req.body.status === 'BOOKED' && req.body.leads_uuid)
  if (req.body.status === 'BOOKED')
    await settleBookingInLead(req.body, customerRecords, req.user);
  let resp = await createLeadService(req.body, req.user);
  if (req.body.status === 'BOOKED' && !req.body.leads_uuid)
    await settleBookingInLead(
      { ...req.body, ...resp.data },
      customerRecords,
      req.user,
    );
  res.json(resp);
  sendWhatsappTemplatesInLead(req.body, customerRecords, req.user);
};

exports.getLead = async (req, res) => {
  let {
    leads_uuid,
    venue_uuid,
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

  const tableName = 'latest_leads';

  let filter = filterFunctionality(
    {
      leads_uuid,
      venue_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    {
      alias: 'll',
    },
  );

  if (advanceFilter)
    filter = advanceFiltering(filter, advanceFilter, {
      ll: ['*'],
      cw_lcws: ['whatsapp_status'],
    });
  filter = await roleFilterService(filter, tableName, req.user);
  // filter = listOrderBy(filter,,true);
  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  // let totalRecords = await getCountRecord(tableName, filter);

  let sql = `SELECT 
    ll.*,
    cw_lcws.whatsapp_status
FROM latest_leads ll 
LEFT JOIN (
    -- Selecting only the latest conversation for each from_number
    SELECT cw.conversation_id, cw.from_number, lcws.status as whatsapp_status
    FROM (
        SELECT ft.*
        FROM conversation_whatsapp AS ft
        LEFT JOIN conversation_whatsapp AS rt
          ON ft.from_number = rt.from_number
          AND ft.conversation_whatsapp_id < rt.conversation_whatsapp_id
        WHERE rt.conversation_whatsapp_id IS NULL
    ) cw  -- Now, this contains only the latest conversation per from_number
    INNER JOIN latest_conversation_whatsapp_status lcws 
        ON cw.conversation_id = lcws.conversation_id
) cw_lcws 
ON CONCAT('+91', ll.contact_number_one) = cw_lcws.from_number ${filter} ${pageFilter}`;

  // console.log('Total Records:', totalRecords);
  // let result = await getRecords(tableName, filter, pageFilter);
  let result = await dbRequest(sql);
  // console.log('Query Result:', result);
  deleteKeyValuePair(result, ['leads_id', 'leads_unique_id']);
  return res.json(responser('All leads', result, result.length));
};

exports.getStatusLead = async (req, res) => {
  const {
    leads_uuid,
    venue_uuid,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    pageLimit,
    itemPerPage,
    advanceFilter,
    type,
    data_wise,
    status_type,
  } = req.query;

  const tableName = 'latest_leads';

  let dateFilterColumn = 'create_ts';
  switch (data_wise) {
    case 'Booking_Month':
      dateFilterColumn = 'followup_date';
      break;
    default:
      dateFilterColumn = 'create_ts';
  }

  console.log(dateFilterColumn, 'dateFilterColumn');

  let filter = filterFunctionality(
    { leads_uuid, venue_uuid },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    { dateFilterColumn },
  );

  console.log(filter, 'filter');
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);

  if (type === 'count') {
    let statusCount = {
      TODAY_FOLLOWUPS: 0,
      MISSED_FOLLOWUPS: 0,
      ONGOING: 0,
      CANCELLED: 0,
      BOOKED: 0,
      POSTPONED: 0,
    };

    // Query for TODAY_FOLLOWUPS
    const todayFollowupsQuery = `
        SELECT COUNT(1) as TODAY_FOLLOWUPS 
        FROM ${tableName} 
        WHERE followup_date = CURDATE() AND status NOT IN ('BOOKED', 'CANCELLED');
    `;
    const todayFollowupsResult = await dbRequest(todayFollowupsQuery);
    statusCount.TODAY_FOLLOWUPS = todayFollowupsResult[0]?.TODAY_FOLLOWUPS || 0;

    // Query for MISSED_FOLLOWUPS
    const missedFollowupsQuery = `
        SELECT COUNT(1) as MISSED_FOLLOWUPS 
        FROM ${tableName} 
        WHERE followup_date < CURDATE() AND status NOT IN ('BOOKED', 'CANCELLED');
    `;
    const missedFollowupsResult = await dbRequest(missedFollowupsQuery);
    statusCount.MISSED_FOLLOWUPS =
      missedFollowupsResult[0]?.MISSED_FOLLOWUPS || 0;

    // Query for Ongoing | Postpond
    const statusCountQuery = `
        SELECT status, COUNT(1) as count 
        FROM ${tableName} where status not in ('BOOKED', 'CANCELLED')
        GROUP BY status;
    `;
    let statusResults = await dbRequest(statusCountQuery);

    // Merge status count results
    statusResults.forEach((row) => {
      if (statusCount.hasOwnProperty(row.status)) {
        statusCount[row.status] = row.count;
      }
    });
    // Query for Booked | Cancelled
    const bookedCancelledQuery = `
        SELECT status, COUNT(1) as count 
        FROM ${tableName} where status in ('BOOKED', 'CANCELLED') ${filter.replace('WHERE', 'AND')}
        GROUP BY status;
    `;
    statusResults = await dbRequest(bookedCancelledQuery);

    // Merge status count results
    statusResults.forEach((row) => {
      if (statusCount.hasOwnProperty(row.status)) {
        statusCount[row.status] = row.count;
      }
    });

    // Return response
    if (status_type && statusCount.hasOwnProperty(status_type)) {
      return res.json(
        responser(
          `Lead Status Count for ${status_type}`,
          { statusCounts: { [status_type]: statusCount[status_type] } },
          0,
          // totalRecords,
        ),
      );
    }

    return res.json(
      responser('Lead Status Count', { statusCounts: statusCount }, 0),
    );
  } else if (type === 'list') {
    if (!status_type) {
      return res.status(400).json({
        message:
          "Missing 'status_type'. Please provide 'TODAY_FOLLOWUPS' or 'MISSED_FOLLOWUPS'.",
      });
    }
    let leadListQuery = `SELECT * FROM ${tableName}`;

    if (status_type === 'TODAY_FOLLOWUPS') {
      leadListQuery = `SELECT * FROM ${tableName} WHERE followup_date = CURDATE() AND status NOT IN ('BOOKED', 'CANCELLED') ${pageFilter};`;
    } else if (status_type === 'MISSED_FOLLOWUPS') {
      leadListQuery = `SELECT * FROM ${tableName} WHERE followup_date < CURDATE() AND status NOT IN ('BOOKED', 'CANCELLED') ${pageFilter};`;
    } else if (status_type === 'ONGOING' || status_type === 'POSTPONED') {
      leadListQuery = `SELECT * FROM ${tableName} WHERE status IN ("${status_type}") ${pageFilter};`;
    } else {
      leadListQuery = `SELECT * FROM ${tableName} WHERE status = '${status_type}' ${filter ? `AND ${filter.replace(/^WHERE\s+/i, '')}` : ''} ${pageFilter};`;
    }

    // console.log(status_type, 'status_type');

    console.log('Generated Query:', leadListQuery);
    let leadList = await dbRequest(leadListQuery);
    return res.json(
      responser('Lead Status List', { leadList }, leadList.length),
    );
  } else {
    return res
      .status(400)
      .json({ message: "Provide 'type' as 'count' or 'list'." });
  }
};

exports.upsertOpportunity = async (req, res) => {
  removeNullValueKey(req.body);
  await isEditAccess('latest_leads_with_opportunity', req.user);

  let oldRecord = {};
  let isUpadtion = false;

  if (req.body.lead_uuid) {
    let isExist = await isRecordExist(
      'latest_leads',
      ['leads_uuid', 'status'],
      [req.body.leads_uuid, 'DEAD'],
    );

    if (!isExist) throwError(404, 'Lead Not Found');

    // Check if an opportunity exists
    oldRecord = (
      await getRecords(
        'opportunity',
        filterFunctionality({ leads_uuid: req.body.leads_uuid }),
      )
    )[0];
    req.body = { ...oldRecord, ...req.body };
  } else {
    req.body.status = 'OPPORTUNITY';
    // Add lead_source if not present
    req.body.lead_source = req.body.lead_source || null;

    let lead = await createLeadService(req.body, req.user, req.headers);
    req.body.leads_id = lead.data.leads_id;
    req.body.status = 'ACTIVE';
  }

  // Check if customer exists or create a new one
  let customerRecords = (
    await getRecords(
      'latest_customer_personal_information',
      `where email='${req.body.email}'`,
    )
  )[0];

  if (!customerRecords) {
    console.log('Customer not found, creating a new customer...');
    customerRecords = (
      await requestApi(
        base_url + '/api/v1/customer/upsert-customer',
        null,
        'POST',
        {
          'Content-Type': 'application/json',
          'auth-Token': req.user.access_token,
        },
        req.body,
      )
    ).data;
  }

  // console.log('customer=>', customerRecords);

  req.body.customer_fact_uuid = customerRecords.customer_fact_uuid;
  req.body.customer_name =
    customerRecords.first_name + ' ' + customerRecords.last_name;
  req.body.opportunity_uuid = v4();

  // Insert the new opportunity
  await handleAuditColumns('latest_opportunity', req.body, ['leads_uuid']);
  const insertResp = await insertRecords('opportunity', req.body);
  res.json(responser('Opportunity has been created successfully.', req.body));
  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'opportunity',
    'leads_uuid',
    'Opportunity',
    insertResp.insertId,
    req.user,
  );
};

exports.getOpportunity = async (req, res) => {
  const tableName = 'latest_leads_with_opportunity';
  let {
    leads_uuid,
    customer_fact_uuid,
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
      leads_uuid,
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);
  // filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  // let columnName = [
  //   'id',
  //   'status',
  //   'lead_id',
  //   'first_name',
  //   'last_name',
  //   'email',
  //   'phone',
  //   'insurance_type',
  //   'insurance_sub_type',
  //   // 'date',
  //   'business_name',
  //   'insert_ts',
  // ];
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result || result.length === 0) {
    return res.json(responser('No records found', [], 0, totalRecords));
  }
  // if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'All leads with opportunity',
      result,
      result.length,
      totalRecords,
    ),
  );
};
