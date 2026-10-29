const {
  getCountRecord,
  insertRecords,
  getRecords,
  dbRequest,
  uploadFile,
  pagination,
  filterFunctionality,
  sendAttachmentsInEmail,
  roleFilterService,
  isEditAccess,
  insertRecordHandleIncremental,
  handleAuditColumns,
  getRecordsCount,
  isRecordExist,
  advanceFiltering,
  updateRecord,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');
const dbService = require('./customer.service');
const {
  getUserProfileWithEveryIdUSerCode,
  getCustomerIdFromPolicForValidUser,
} = require('./customer.service');
const {
  responser,
  setDateTimeFormat,
  requestErrorHandlingDecorator,
  throwError,
  removeNullValueKey,
  generateCode,
} = require('../../utils/helperFunction');
const {
  ejsPreview,
  twilio,
  pdfMaker,
  downloadFileS3,
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');
const moment = require('moment');

exports.upsertCustomer = async (req, res) => {
  console.log(
    '<-----------------------------------upsert customer----------------------------------->',
  );
  const { customer_fact_uuid } = req.body;
  req.body.contact_number =
    (req.body.contact_number.startsWith('+91') ? '' : '+91') +
    req.body.contact_number;
  await isEditAccess('customer_fact', req.user);
  removeNullValueKey(req.body);
  let isUpadtion = true;

  const oldRecord = await getRecords(
    'customer_fact',
    `where customer_fact_uuid='${customer_fact_uuid}' `,
  );
  if (!oldRecord) {
    throwError(404, 'Customer not found.');
  }

  if (req.body.customer_fact_uuid) {
    if (oldRecord[0].status.toUpperCase() !== req.body.status.toUpperCase()) {
      await updateRecord(
        'customer_fact',
        {
          status: req.body.status,
        },
        {
          customer_fact_uuid: customer_fact_uuid,
        },
      );
    }
    let existedInfo = await getRecords(
      'latest_customer_personal_information',
      `where customer_fact_uuid='${customer_fact_uuid}' `,
    );

    if (existedInfo.length) {
      console.log('customer personal data ', existedInfo[0]);
      req.body = { ...existedInfo[0], ...req.body };
    }

    let isExist = await getRecords(
      'latest_customer_prospect_details',
      `where customer_fact_uuid='${customer_fact_uuid}' `,
    );

    if (isExist.length) {
      req.body = { ...isExist[0], ...req.body };
      await insertRecords('customer_prospect_details', req.body);
    }
  } else {
    let isExist = await isRecordExist(
      'customer_fact',
      ['contact_number'],
      [req.body.contact_number],
    );
    if (isExist) return throwError(406, 'Customer already exist.');
    req.body.customer_fact_uuid = v4();
    await insertRecords('customer_fact', req.body);
    let customer = (
      await getRecords(
        'customer_fact',
        `where contact_number="${req.body.contact_number}"`,
        null,
        null,
        { isPrmiaryId: true },
      )
    )[0];
    console.log('customer fact=>', customer);
    req.body.customer_fact_uuid = customer.customer_fact_uuid;
    req.body.customer_code = generateCode({ length: 10 });
    req.body.customer_name = req.body.name_of_guest;
    // req.body.status = 'PROSPECT';

    let prospectData = JSON.parse(JSON.stringify(req.body));
    await handleAuditColumns('latest_customer_prospect_details', prospectData, [
      'customer_fact_uuid',
    ]);
    await insertRecords('customer_prospect_details', prospectData);
    //  req.body.status = 'ACTIVE';
    req.body.status = 'PROSPECT';

    req.body.customer_personal_information_uuid = v4();
    req.body.goes_by = req.body.first_name;
    req.body.create_ts = setDateTimeFormat('timestamp');
  }
  let insertResp = await insertRecords(
    'customer_personal_information',
    req.body,
  );

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'customer_fact',
    'customer_fact_uuid',
    'Customer',
    insertResp.insertId,
    req.body?.remarks,
    req.user,
  );

  res.json(responser('Customer updated successfully.', req.body));
};

exports.getCustomer = async (req, res) => {
  let {
    customer_fact_uuid,
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
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    {
      alias: 'cf',
    },
  );

  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);

  filter = await roleFilterService(filter, 'customer_fact', req.user);

  // let totalRecords = await getCountRecord(tableName, filter);
  let sql = `select lcpi.*, cf.contact_number ,cf.status  from customer_fact cf inner join 
  latest_customer_personal_information lcpi 
  on cf.customer_fact_uuid = lcpi.customer_fact_uuid ${filter} ${filter ? ' and ' : 'where '} cf.status <> 'INACTIVE' ${pageFilter}`;
  let result = await dbRequest(sql);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(responser('Customers', result, result.length));
};
exports.getCustomerPersonalDetails = async (req, res) => {
  const tableName = 'latest_customer_personal_information';
  let {
    customer_fact_uuid,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
  } = req.query;
  let filter = filterFunctionality(
    {
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'customer_fact', req.user);

  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Customer personal Details', result, result.length, totalRecords),
  );
};

exports.insertTransaction = async (req, res) => {
  await isEditAccess('latest_transaction', req.user);
  removeNullValueKey(req.body);

  let [customerData] = await getRecords(
    'latest_customer_info',
    `where customer_fact_uuid='${req.body.customer_fact_uuid}'`,
  );

  // if customer not then check with opportunity
  if (!customerData) {
    [customerData] = await getRecords(
      'latest_opportunity',
      `where opportunity_uuid='${req.body.customer_fact_uuid}'`,
    );
    if (!customerData) {
      throwError(404, 'customer not found to make transaction.');
    }
    customerData.customer_fact_uuid = customerData.opportunity_uuid;
  }

  // console.log('customerData', customerData);

  req.body.transaction_uuid = v4();
  req.body.create_ts = setDateTimeFormat('timestamp');
  let insertResp = await insertRecords('transaction', {
    ...customerData,
    ...req.body,
  });
  console.log('req body', req.body);

  saveHistory(
    {
      oldRecord: customerData,
      newRecord: req.body,
    },
    'transaction',
    'customer_fact_uuid',
    'Transaction',
    insertResp.insertId,
    req.user,
  );

  res.json(responser('Transaction created successfully.', req.body));
};
exports.getTransaction = async (req, res) => {
  const {
    transaction_uuid,
    customer_fact_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_transaction';
  let filter = filterFunctionality(
    {
      transaction_uuid,
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );

  let pageFilter = pagination(pageNo, itemPerPage);
  filter = await roleFilterService(filter, tableName, req.user);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  return res.json(
    responser('Transaction ', result, result.length, totalRecords),
  );
};

exports.getTransactionReceipt = async (req, res) => {
  const { customer_fact_uuid, transaction_uuid, isPreview, isIndianStyle } =
    req.query;

  const [customer] = await getRecords(
    'latest_customer_info',
    `where customer_fact_uuid='${customer_fact_uuid}'`,
  );

  if (!customer) throwError(404, 'customer not found');

  console.log('customer: ', customer);
  let feeFilter = transaction_uuid
    ? `AND transaction_uuid='${transaction_uuid}'`
    : ``;

  const fee = await getRecords(
    'latest_transaction',
    `where customer_fact_uuid='${customer_fact_uuid}' ${feeFilter}`,
  );

  if (!fee) {
    throwError(404, 'Transaction not found');
  }

  const convertToIndianTime = (isoDateString) => {
    const date = new Date(isoDateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    return date;
  };

  const transactions = fee.map((detail) => ({
    courses_name: 'BTech',
    session: '2025-2026',
    courses_fees: '100000',
    date: convertToIndianTime('2025-01-09 16:58:17'),
  }));
  console.log('transactions', transactions[0]);

  if (isPreview === 'true') {
    result = await ejsPreview(
      {
        student_name: customer.customer_name,
        leads_code: customer.customer_code,
        organizations_name: 'boilerplate',
        transactions: JSON.parse(JSON.stringify(transactions)),
      },
      'pdf/transactionReceipt.ejs',
    );
    // return res.json(responser('PO EJS', result));
    res.send(result);
  } else {
    result = await pdfMaker(
      {
        student_name: customer.customer_name,
        leads_code: customer.customer_code,
        organizations_name: 'boilerplate',
        transactions: JSON.parse(JSON.stringify(transactions)),
      },
      'transactionReceipt.ejs',
      {
        isTitlePage: false,
      },
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="proforma_invoice.pdf"',
    );
    res.send(Buffer.from(result));
  }
};

exports.upsertPackageStructure = async (req, res) => {
  await isEditAccess('latest_package_structure', req.user);
  removeNullValueKey(req.body);
  isUpadtion = false;

  if (req.body.package_structure_uuid) {
    isUpadtion = true;
    let packageStructure = await getRecords(
      'latest_package_structure',
      `where package_structure_uuid='${req.body.package_structure_uuid}'`,
    );
    if (!packageStructure) throwError(404, 'Package Structure not exists');
    packageStructure = packageStructure[0];

    req.body = { ...packageStructure, ...req.body };
    // console.log('req.body---->', req.body);
    req.body.create_ts = setDateTimeFormat('timestamp');
  } else {
    req.body.package_structure_uuid = v4();
    req.body.create_ts = setDateTimeFormat('timestamp');
  }
  await insertRecords('package_structure', req.body);
  return res.json(
    responser(
      `Package structure ${isUpadtion ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
};

exports.editCustomerPersonalInformation = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  await isEditAccess('customer_fact', req.user);
  // req.body.customer_personal_information = v4();
  req.body.create_ts = setDateTimeFormat('timestemp', req.body.create_ts);

  let userProfile = (
    await getRecords(
      'latest_user',
      filterFunctionality({ user_uuid: req.user.user_uuid }),
    )
  )[0];
  let payload = {
    branch_code: userProfile?.branch_code,
    branch: userProfile?.branch_name,
    assigned_to_uuid: userProfile?.user_uuid,
    assigned_to_code: userProfile?.user_code,
  };
  let data = req.body;
  if (!data.customer_fact_uuid) {
    let isExist = await isRecordExist('customer_fact', ['email'], [data.email]);
    if (isExist) return throwError(406, 'Customer already exist.');
    data.customer_fact_uuid = v4();
    await insertRecords('customer_fact', data);
    let customer = (
      await getRecords(
        'customer_fact',
        `where email="${data.email}"`,
        null,
        null,
        { isPrmiaryId: true },
      )
    )[0];
    console.log('customer fact=>', customer);
    data.customer_fact_uuid = customer.customer_fact_uuid;
    data.customer_code = generateCode({ length: 10 });
    data.customer_name =
      data.first_name + (data.last_name ? ' ' + data.last_name : '');
    data.status = data.opportunity ? 'OPPORTUNITY' : 'ACTIVE';
    let prospectData = JSON.parse(JSON.stringify(data));
    await handleAuditColumns('latest_customer_prospect_details', prospectData, [
      'customer_fact_uuid',
    ]);
    await insertRecords('customer_prospect_details', prospectData);
    data.status = 'ACTIVE';
    data.customer_personal_information_uuid = v4();
    data.goes_by = data.first_name;
  } else {
    oldRecord = (
      await getRecords(
        'latest_customer_personal_information',
        filterFunctionality({
          customer_fact_uuid: req.body.customer_fact_uuid,
        }),
      )
    )[0];
    if (!oldRecord)
      return throwError(406, 'Invalid customer personal information.');
    data = { ...oldRecord, ...data };
    isUpdate = true;
  }
  await handleAuditColumns('latest_customer_personal_information', data, [
    'customer_fact_uuid',
  ]);
  let insertResp = await insertRecords('customer_personal_information', data);
  res.json(
    responser(
      `Customer has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      data,
    ),
  );

  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'customer_personal_information',
    'customer_fact_uuid',
    'Customer',
    insertResp.insertId,
    req.user,
  );
};

exports.getCustomerPersonalInformation = async (req, res) => {
  const tableName = 'latest_customer_personal_information';
  let {
    customer_fact_uuid,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
  } = req.query;
  let filter = filterFunctionality(
    {
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'customer_fact', req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Personal Informations', result, result.length, totalRecords),
  );
};

exports.editCustomerProspectDetails = async (req, res) => {
  removeNullValueKey(req.body);
  await isEditAccess('customer_fact', req.user);

  const isUnique =
    await dbService.checkCustomerProspectDetailsCustomerCodeService(req.body);
  if (isUnique.length && isUnique[0].customer_id !== req.body.customer_id)
    throwError(406, 'Customer code already exist.');
  let oldRecord = (
    await getRecords(
      'latest_customer_prospect_details',
      filterFunctionality({
        customer_fact_uuid: req.body.customer_fact_uuid,
      }),
    )
  )[0];
  if (!oldRecord) throwError(406, 'Invalid customer Prospect details.');
  await handleAuditColumns('latest_customer_prospect_details', req.body, [
    'customer_fact_uuid',
  ]);
  req.body = { ...oldRecord, ...req.body };
  let insertResp = await insertRecords('customer_prospect_details', req.body);
  res.json(
    responser(
      'CustomerProspectDetails has been created successfully.',
      req.body,
    ),
  );

  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'customer_prospect_details',
    'customer_fact_uuid',
    'Customer Prospect Details',
    insertResp.insertId,
    req.user,
  );
};

exports.getCustomerProspectDetails = async (req, res) => {
  const tableName = 'latest_customer_prospect_details';
  let {
    customer_fact_uuid,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
  } = req.query;
  let filter = filterFunctionality(
    {
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'customer_fact', req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Prospect Details', result, result.length, totalRecords),
  );
};

exports.editCustomerSocial = async (req, res) => {
  await isEditAccess('customer_fact', req.user);
  let oldRecord = (
    await getRecords(
      'latest_customer_social',
      filterFunctionality({
        customer_fact_uuid: req.body.customer_fact_uuid,
      }),
    )
  )[0];
  if (oldRecord) req.body = { ...oldRecord, ...req.body };
  const insertResp = await insertRecords('customer_social', req.body);
  res.json(
    responser('CustomerSocial has been updated successfully.', req.body),
  );

  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'customer_social',
    'customer_fact_uuid',
    'Customer Social',
    insertResp.insertId,
    req.user,
  );
};

exports.getCustomerSocial = async (req, res) => {
  const tableName = 'latest_customer_social';
  let {
    customer_fact_uuid,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
  } = req.query;
  let filter = filterFunctionality(
    {
      customer_fact_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  filter = await roleFilterService(filter, 'customer_fact', req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Customer Social Records', result, result.length, totalRecords),
  );
};
