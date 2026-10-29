const { json } = require('express');
const {
  getCountRecord,
  insertRecords,
  getRecords,
  filterFunctionality,
  isEditAccess,
  roleFilterService,
  insertRecordHandleIncremental,
  isExist,
  isRecordExist,
  insertAndHandleNewMaxForPrimaryIdColumnService,
  handleAuditColumns,
  pagination,
  getRecordsCount,
  uploadService,
  dbRequest,
} = require('../../utils/dbFunctions');
const {
  responser,

  throwError,
  setDateTimeFormat,
  generateCode,

  requestApi,
  advanceFiltering,
  getTableColumnsNames,
  removeNullValueKey,
} = require('../../utils/helperFunction');
const {
  BASE_URL,
  S3_PUBLIC_PREFIX_URL,
} = require('../../config/server.config');
const { v4 } = require('uuid');
// const XLSX = require('xlsx');
const fs = require('fs');
const moment = require('moment');
const {
  calculateTotals,
  getColumnAndFilterConditionForGL,
  getColumnAndFilterConditionForGl,
  getColumnAndFilterConditionForArORAp,
  getValuesForTransactionReport,
} = require('./accounting.service');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');
const { create } = require('domain');

exports.editAccountPaymentAccountsReceivable = async (req, res) => {
  await handleAuditColumns(
    'latest_accn_invoice_payment_accounts_receivable',
    req.body,
    ['invoice_id'],
  );
  // let invoice_details = req.body.invoice_details;
  // req.body.invoice_details =null;

  // if (!req.body.payment_id )
  //   req.body.payment_number = generateCode({length:10});
  req.body.accn_invoice_payment_accounts_receivable_uuid = v4();
  const result = await insertRecords(
    'accn_invoice_payment_accounts_receivable',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));

  // Invoice Items
  let maxTransactionId =
    (
      await dbRequest(
        `select max(accn_transaction_id) as maxTransactionId from accn_invoice_payment_transaction_items`,
      )
    )[0]?.maxTransactionId || 0;
  req.body.invoice_details = await Promise.all(
    invoice_details.map(async (ele) => {
      let checkAmount = ele.net_payable - ele.payment_paid,
        create_ts,
        created_by_uuid,
        modified_by_uuid;
      let is_partial_payment = 1;

      let checkRecord = (
        await getRecords(
          'accn_invoice_payment_transaction_items',
          `where invoice_number = '${ele.invoice_number}' and accn_transaction_id = ${ele?.accn_transaction_id || -1} limit 1`,
          null,
          ['create_ts', 'created_by_uuid'],
        )
      ).result;

      if (checkRecord) {
        create_ts = checkRecord[0].create_ts;
        created_by_uuid = checkRecord[0].created_by_uuid;
        modified_by_uuid = req.user.user_fact_id;
      } else {
        create_ts = setDateTimeFormat('timestemp');
        created_by_uuid = modified_by_uuid = req.user.user_fact_id;
      }

      return {
        ...ele,
        accn_transaction_id: !ele.accn_transaction_id
          ? ++maxTransactionId
          : ele.accn_transaction_id,
        entry_type: req.body.entry_type,
        // payment_number: req.body.payment_number,
        payment_id: req.body.payment_id,
        gl_accounts: req.body.gl_accounts,
        invoice_payment_gl_account_name:
          req.body.invoice_payment_gl_account_name,
        batch_number: req.body.batch_number,
        reciept_number: req.body.reciept_number,
        payment_for: req.body.payment_for,
        name: req.body.name,
        code: req.body.customer_code,
        policy_number: req.body.policy_number,
        payment_type: req.body.payment_type,
        payment_currency: req.body.payment_currency,
        payment_amount: req.body.payment_amount,
        service_fee: req.body.service_fee,
        payment_method: req.body.payment_method,
        bank: req.body.bank,
        create_ts,
        created_by_uuid,
        modified_by_uuid,
        is_partial_payment: checkAmount === 0 ? 0 : is_partial_payment,
      };
    }),
  );
  console.log(req.body.invoice_details);
  req.body.accn_invoice_payment_transaction_items_uuid = v4();
  await insertRecords(
    'accn_invoice_payment_transaction_items',
    req.body.invoice_details,
  );
  return res.json(
    responser(
      result[0]
        ? result[0][0]
          ? result[0][0].msg
          : result[0].msg
        : 'Successfully Updated!',
      req.body,
    ),
  );
};
exports.editAccountInvoicePaymentTransactionItems = async (req, res) => {
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  await handleAuditColumns(
    'latest_accn_invoice_payment_transaction_items',
    req.body,
    ['accn_invoice_payment_transaction_items_unique_id', 'invoice_number'],
  );
  req.body.accn_invoice_payment_transaction_items_uuid = v4();
  const result = await insertRecordHandleIncremental(
    'accn_invoice_payment_transaction_items',
    'invoice_number',
    'accn_invoice_payment_transaction_items_unique_id',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      result[0]
        ? result[0][0]
          ? result[0][0].msg
          : result[0].msg
        : 'Successfully Updated!',
    ),
  );
};

exports.getAccountInvoicePaymentTransactionItems = async (req, res) => {
  const tableName = 'latest_accn_invoice_payment_transaction_items';
  let {
    accn_invoice_payment_transaction_items_id,
    accn_invoice_payment_transaction_items_unique_id,
    accn_invoice_payment_transaction_items_uuid,
    invoice_id,
    invoice_number,
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
      accn_invoice_payment_transaction_items_id,
      accn_invoice_payment_transaction_items_unique_id,
      accn_invoice_payment_transaction_items_uuid,
      invoice_id,
      invoice_number,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Invoice Payment Transaction Items Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};
// <-------------------------------------------------------Receivable Payment (Modification in records)------------------------------------------------------------------------->
exports.getAccountPaymentAccountsReceivable = async (req, res) => {
  const tableName = 'latest_accn_invoice_payment_accounts_receivable';
  let {
    customer_id,
    customer_policy_id,
    payment_id,
    code,
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
      customer_id,
      customer_policy_id,
      payment_id,
      code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));

  if (result.length === 1 && (payment_id || code)) {
    let invoice_details = (
      await getRecords(
        'latest_accn_invoice_payment_transaction_items',
        `where payment_number = '${result[0].payment_number}' AND status="ACTIVE"`,
      )
    ).result;
    result[0].invoice_details = invoice_details.map((ele) => {
      return {
        ...ele,
        // payment_paid: null,
        total_due_dollar: ele.invoice_total_due_dollar,
        amount_due: ele.actual_amount_due,
      };
    });

    // let totalAmountPaid = 0, invoiceDetailsArr = [];
    // await Promise.all(invoice_details.map(async(ele)=>{
    //   let {total_due_dollar} = (await getRecords("latest_accn_invoice_information",`where invoice_number = '${ele.invoice_number}' AND status="ACTIVE"`,null,["total_due_dollar"])).result[0];
    //   // let invoiceRecord = (await getRecords("latest_accn_invoice_payment_transaction_items",`where invoice_number = '${ele.invoice_number}' AND status="ACTIVE"`,null,["payment_paid"])).result;
    //   // invoiceRecord.map(ele=>totalAmountPaid+=ele.payment_paid);
    //   let obj = {
    //     ...ele,
    //     total_due_dollar,
    //     // amount_due : total_due_dollar - totalAmountPaid,
    //     payment_paid: null
    //   }
    //   invoiceDetailsArr.push(obj);
    // }))
    // result[0].invoice_details = invoiceDetailsArr;
  }
  return res.json(
    responser(
      'Payment Accounts Receivable Records',
      result,
      result.length,
      totalRecords.result[0].totalRecords,
    ),
  );
};
// <-------------------------------------------------------Receivable Payment History------------------------------------------------------------------------->
exports.getAccountPaymentAccountsReceivableHistory = async (req, res) => {
  const tableName = 'latest_accn_invoice_payment_accounts_receivable';
  let {
    customer_id,
    customer_policy_id,
    payment_id,
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
      customer_id,
      customer_policy_id,
      payment_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));

  if (result.length === 1 && payment_id) {
    let invoice_details = (
      await getRecords(
        'latest_accn_invoice_payment_transaction_items',
        `where payment_number = '${result[0].payment_number}' AND status="ACTIVE"`,
      )
    ).result;
    result[0].invoice_details = invoice_details;
  }

  return res.json(
    responser(
      'Payment Accounts Receivable Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccountCompanyChartsOfAccounts = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_company_charts_of_accounts_uuid) {
    if (!req.body.company_charts_of_accounts_code) {
      req.body.company_charts_of_accounts_code = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_company_charts_of_accounts',
      ['accn_company_charts_of_accounts_unique_id'],
      [accn_company_charts_of_accounts_unique_id],
    );
    if (isExist) {
      return throwError(406, 'GL Account ID already exists.');
    }

    req.body.accn_company_charts_of_accounts_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_company_charts_of_accounts',
        filterFunctionality({
          accn_company_charts_of_accounts_uuid:
            req.body.accn_company_charts_of_accounts_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid accn_company_charts_of_accounts.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  await handleAuditColumns('latest_accn_company_charts_of_accounts', req.body, [
    'company_charts_of_accounts_code',
    'incremental_number',
  ]);
  // req.body = { ...oldRecord, ...req.body };

  req.body.accn_company_charts_of_accounts_uuid = v4();
  const result = await insertRecordHandleIncremental(
    'accn_company_charts_of_accounts',
    'incremental_number',
    'company_charts_of_accounts_code',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));

  res.json(responser('Successfully Updated!', req.body));
  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_company_charts_of_accounts',
    'accn_company_charts_of_accounts_uuid',
    'accn_company_charts_of_accounts',
    result.insertId,
    req.user,
  );
};

exports.getAccountCompanyChartsOfAccounts = async (req, res) => {
  const tableName = 'latest_accn_company_charts_of_accounts';
  let {
    accn_company_charts_of_accounts_id,
    accn_company_charts_of_accounts_unique_id,
    accn_company_charts_of_accounts_uuid,
    company_charts_of_accounts_code,
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
      accn_company_charts_of_accounts_id,
      accn_company_charts_of_accounts_unique_id,
      accn_company_charts_of_accounts_uuid,
      customer_id,
      company_charts_of_accounts_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Customer Social Records', result, result.length, totalRecords),
  );
};

exports.editAccountCompanyGlAccounts = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  await isEditAccess('latest_customer_all_detailed_record', req.user);
  if (!req.body.accn_company_gl_accounts_uuid) {
    if (!req.body.gl_account_id) {
      req.body.gl_account_id = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_company_gl_accounts',
      ['gl_account_id'],
      [req.body.gl_account_id],
    );
    if (isExist) {
      return throwError(406, 'GL Account ID already exists.');
    }

    req.body.accn_company_gl_accounts_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_company_gl_accounts',
        filterFunctionality({
          accn_company_gl_accounts_uuid: req.body.accn_company_gl_accounts_uuid,
        }),
      )
    )[0];

    if (!oldRecord) throwError(406, 'Invalid accn_company_gl_accounts.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_company_gl_accounts', req.body, [
    'gl_account_id',
  ]);

  // req.body.accn_company_gl_accounts_uuid = v4();
  const result = await insertRecords('accn_company_gl_accounts', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_company_gl_accounts',
    'accn_company_gl_accounts_uuid',
    'accn_company_gl_accounts',
    result.insertId,
    req.user,
  );
};

exports.getAccountCompanyGlAccounts = async (req, res) => {
  const tableName = 'latest_accn_company_gl_accounts';
  let {
    accn_company_gl_accounts_id,
    accn_company_gl_accounts_uuid,
    accn_company_gl_accounts_unique_id,
    gl_account_id,
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
      accn_company_gl_accounts_id,
      accn_company_gl_accounts_uuid,
      accn_company_gl_accounts_unique_id,
      gl_account_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Account Company Gl Accounts',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccountCompanyInformation = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_company_information_uuid) {
    let isExist = await isRecordExist(
      'accn_company_information',
      ['accn_company_information_unique_id'],
      [req.body.accn_company_information_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Company Information already exists.');
    }

    // Generate new UUID for the record
    req.body.accn_company_information_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_company_information',
        filterFunctionality({
          accn_company_information_uuid: req.body.accn_company_information_uuid,
        }),
      )
    )[0];

    if (!oldRecord) {
      return throwError(406, 'Invalid accn_company_information.');
    }
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  // req.body.accn_company_information_uuid = v4();
  await handleAuditColumns('latest_accn_company_information', req.body, [
    'accn_company_information_uuid',
  ]);
  const result = await insertRecords('accn_company_information', req.body);
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));

  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_company_information',
    'accn_company_information_uuid',
    'Company Information',
    result.insertId,
    req.user,
  );
};

exports.getAccountCompanyInformation = async (req, res) => {
  const tableName = 'latest_accn_company_information';
  let {
    accn_company_information_unique_id,
    accn_company_information_id,
    accn_company_information_uuid,
    company_id,
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
      accn_company_information_unique_id,
      accn_company_information_id,
      accn_company_information_uuid,
      company_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  // let result = await dbRequest(
  //   `SELECT *, concat('${S3_PUBLIC_PREFIX_URL}', logo) preview_logo, concat('${S3_PUBLIC_PREFIX_URL}', fav_icon) preview_fav_icon FROM ${tableName} ${filter} ${pageFilter}`,
  // );
  let result = await getRecords(tableName, filter, pageFilter);

  // let { result, errMsg } = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Account Company Information',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.getAccountCompanyInformationPublic = async (req, res) => {
  const tableName = 'latest_accn_company_information';

  let result = await dbRequest(
    `SELECT company_name, concat('${S3_PUBLIC_PREFIX_URL}', logo) preview_logo, concat('${S3_PUBLIC_PREFIX_URL}', fav_icon) preview_fav_icon FROM ${tableName}`,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Accounting Company Information Record',
      result,
      result.length,
      result.length,
    ),
  );
};

exports.editAccountCompanyOnboarding = async (req, res) => {
  let isUpdate = false;
  let oldRecord = {};
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  if (!req.body.accn_company_onboarding_uuid) {
    if (!req.body.company_id) {
      req.body.company_id = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_company_onboarding',
      ['company_id'],
      [req.body.company_id],
    );
    if (isExist) {
      return throwError(406, 'Company ID already exists.');
    }

    // Generate a new UUID for the onboarding record
    req.body.accn_company_onboarding_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_company_onboarding',
        filterFunctionality({
          accn_company_onboarding_uuid: req.body.accn_company_onboarding_uuid,
        }),
      )
    )[0];

    if (!oldRecord) throwError(406, 'Invalid accn_company_onboarding.');

    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_company_onboarding', req.body, [
    'company_id',
  ]);

  const result = await insertRecords('accn_company_onboarding', req.body);
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_company_onboarding',
    'accn_company_onboarding_uuid',
    'Onboarding',
    result.insertId,
    req.user,
  );
};

exports.getAccountCompanyOnboarding = async (req, res) => {
  const tableName = 'latest_accn_company_onboarding';
  let {
    accn_company_onboarding_id,
    accn_company_onboarding_unique_id,
    accn_company_onboarding_uuid,
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
      accn_company_onboarding_id,
      accn_company_onboarding_unique_id,
      accn_company_onboarding_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Account Company Onboarding',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccnInvoice = async (req, res) => {
  // await handleAuditColumns('accn_invoice_information', req.body, [
  //   'invoice_number',
  // ]);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_invoice_information_uuid) {
    if (!req.body.invoice_number) {
      req.body.invoice_number = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_invoice_information',
      [' invoice_number'],
      [req.body.invoice_number],
    );
    if (isExist) {
      return throwError(406, 'Account invoice number not exist.');
    }

    // Generate a new UUID for the onboarding record
    req.body.accn_invoice_information_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_invoice_information',
        filterFunctionality({
          accn_invoice_information_uuid: req.body.accn_invoice_information_uuid,
        }),
      )
    )[0];

    if (!oldRecord) throwError(406, 'Invalid .');

    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }

  calculateTotals(req.body);
  await handleAuditColumns('accn_invoice_information', req.body, [
    'invoice_number',
  ]);
  req.body.accn_invoice_information_uuid = v4();
  const result = await insertRecordHandleIncremental(
    'accn_invoice_information',
    'invoice_information_id ',
    'invoice_number',
    req.body,
  );

  // Invoice Items
  let maxTransactionId =
    (
      await dbRequest(
        `select max(accn_transaction_id) as maxTransactionId from accn_invoice_transaction_items`,
      )
    )[0]?.maxTransactionId || 0;

  let policyData = (column = value = null);
  if (req.body.invoice_for) {
    if (req.body.invoice_for === 'Customer') {
      column = 'policy_number';
      value = req.body.policy_number;
    } else if (req.body.invoice_for === 'Producer') {
      column = 'producer_one_code';
      value = req.body.code;
    } else if (req.body.invoice_for === 'Insurer') {
      column = 'insurer';
      value = req.body.code;
    } else if (req.body.invoice_for === 'User');
    else throwError(404, 'Invalid Invoice For!');

    let policyData = (
      await getRecords(
        'latest_all_customer_policy_details',
        `WHERE ${column} = "${value}"`,
      )
    ).result;
    if (!policyData)
      return throwError(404, `No Record found for this ${column}!`);
    policyData = policyData[0];
  }

  req.body.invoice_details = await Promise.all(
    req.body.invoice_details.map(async (ele) => {
      await getRecords(
        'latest_accn_transaction_type',
        `WHERE transaction_type = "${ele.transaction_type}"`,
        null,
        ['create_ts', 'created_by_uuid'],
      );

      let checkRecord = (
        await getRecords(
          'accn_invoice_transaction_items',
          `where invoice_number = '${ele.invoice_number}' and accn_transaction_id = ${ele?.accn_transaction_id || -1} limit 1`,
          null,
          ['create_ts', 'created_by_uuid'],
        )
      ).result;
      let create_ts, created_by_uuid, modified_by_uuid;
      if (checkRecord) {
        create_ts = checkRecord[0].create_ts;
        created_by_uuid = checkRecord[0].created_by_uuid;
        modified_by_uuid = req.user.user_fact_id;
      } else {
        create_ts = setDateTimeFormat('timestemp');
        created_by_uuid = modified_by_uuid = req.user.user_fact_id;
      }

      return {
        ...ele,
        accn_transaction_id: !ele.accn_transaction_id
          ? ++maxTransactionId
          : ele.accn_transaction_id,
        // gl_account_code,
        gl_sales_account_name: req.body.gl_sales_account_name,
        invoice_for: req.body.invoice_for,
        // invoice_number: req.body.invoice_number,
        invoice_date: req.body.invoice_date,
        invoice_due_date: req.body.invoice_due_date,
        payment_terms: req.body.payment_terms,
        name: req.body.name,
        // code: req.body.code,
        policy_number: req.body.policy_number,
        policy_type: req.body.policy_type,
        policy_transaction_type: req.body.policy_transaction_type,
        policy_status: req.body.policy_status,
        transaction_date: req.body.transaction_date,
        effective_date: req.body.effective_date,
        default_tax_region: req.body.default_tax_region,
        agency_or_direct_bill: req.body.agency_or_direct_bill,
        insurer_code: req.body.insurer_code,
        premium_financed: req.body.premium_financed,
        financed_by: req.body.financed_by,
        finance_fee: req.body.finance_fee,
        producer_one_id: policyData?.producer_one || null,
        producer_one_code: policyData?.producer_one_code || null,
        producer_two_id: policyData?.producer_two || null,
        producer_two_code: policyData?.producer_two_code || null,
        producer_three_id: policyData?.producer_three || null,
        producer_three_code: policyData?.producer_three_code || null,
        branch: policyData?.branch_name || null,
        branch_code: policyData?.branch_code || null,
        total_due_dollar: req.body.total_due_dollar,
        create_ts,
        created_by_uuid,
        modified_by_uuid,
      };
    }),
  );
  req.body.accn_invoice_transaction_items_uuid = v4();
  await insertRecords(
    'accn_invoice_transaction_items',
    req.body.invoice_details,
  );

  // if (req.body?.insurer_code === '') req.body.insurer_code = null;
  // let getInsurer = (
  //   await getRecords(
  //     'latest_insurer_code',
  //     `WHERE insurer_code = "${req.body?.insurer_code || -1}"`,
  //   )
  // ).result;

  // if (
  //   req.body.policy_status === 'Active' &&
  //   agency_or_direct_bill === 'A' &&
  //   !checkInvoiceId
  // ) {
  //   let billDataObj = {
  //     bill_number: generateCode({ length: 10 }),
  //     vendor: getInsurer.length ? getInsurer[0].name : null,
  //     code: req.body.insurer_code,
  //     vendor_type: 'Insurer',
  //     bill_date: req.body.invoice_date,
  //     due_date: req.body.invoice_date,
  //     payment_terms: 'Due on Receipt',
  //     // gl_expense_account: null,
  //     sub_total_amount: req.body.net_payable_insurer,
  //     total_due_amount: req.body.net_payable_insurer,
  //     bill_notes: req.body.name + ' ' + req.body.policy_number,
  //     create_ts: req.body.create_ts,
  //   };
  //   const result =
  //     await insertAndHandleNewMaxForPrimaryIdColumnService(
  //       'accn_create_bill',
  //       'bill_id',
  //       billDataObj,
  //     );
  //   if (!result) return res.status(500).json(responser(errMsg));

  //   let maxTransactionId =
  //     (
  //       await dbRequest(
  //         `select max(accn_transaction_id) as maxTransactionId from accn_bill_transaction_items`,
  //       )
  //     )?.result[0]?.maxTransactionId || 0;
  //   let billTransactionItemDataObj = {
  //     accn_transaction_id: ++maxTransactionId,
  //     bill_number: billDataObj.bill_number,
  //     bill_id: billDataObj.bill_id,
  //     vendor: billDataObj.vendor,
  //     code: billDataObj.code,
  //     vendor_type: billDataObj.vendor_type,
  //     bill_date: billDataObj.bill_date,
  //     due_date: billDataObj.due_date,
  //     payment_terms: billDataObj.payment_terms,
  //     detail: 'Insurer Payable',
  //     // account: null,
  //     amount: req.body.net_payable_insurer,
  //     final_amount: req.body.net_payable_insurer,
  //     create_ts: req.body.create_ts,
  //   };
  //   await insertRecords(
  //     'accn_bill_transaction_items',
  //     billTransactionItemDataObj,
  //   );
  // }

  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      result[0]
        ? result[0][0]
          ? result[0][0].msg
          : result[0].msg
        : 'Successfully Updated!',
    ),
  );
};

exports.getAccnInvoice = async (req, res) => {
  const tableName = 'latest_accn_invoice_information';
  let {
    accn_invoice_information_uuid,
    accn_invoice_information_unique_id,
    accn_invoice_information_id,
    policy_id,
    invoice_id,
    accounting_information_id,
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
      accn_invoice_information_uuid,
      accn_invoice_information_unique_id,
      accn_invoice_information_id,
      policy_id,
      invoice_id,
      accounting_information_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  if (result.length >= 1 && (invoice_id || policy_id)) {
    if (invoice_id) {
      let invoice_details = (
        await getRecords(
          'latest_accn_invoice_transaction_items',
          filterFunctionality({
            invoice_number: req.body.invoice_number,
            status: 'ACTIVE',
          }),
          // `where invoice_number = '${result[0].invoice_number}'  AND status="ACTIVE"`,
        )
      )[0];
      let invoiceTransactionItems = (
        await getRecords(
          'latest_accn_invoice_payment_transaction_items',
          filterFunctionality({
            invoice_number: req.body.invoice_number,
          }),
          // `WHERE invoice_number='${result[0].invoice_number}'`,
          null,
          ['payment_paid'],
        )
      ).result;
      if (invoiceTransactionItems.length) {
        let amountPaid = 0;
        invoiceTransactionItems.map((ele) => (amountPaid += ele.payment_paid));
        result[0].amount_due = result[0].total_due_dollar - amountPaid;
        result[0].amount_paid = amountPaid;
      }
    } else if (policy_id || invoice_number) {
      result.map((ele) => {
        if (ele.payment_paid !== null && ele.remaining_amount_due !== null) {
          ele.amount_paid = ele.payment_paid;
          ele.amount_due = ele.remaining_amount_due;
        }
      });
    }
  }
  return res.json(
    responser(
      'Invoice Information Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.getAccnInvoiceAndPaymentHistory = async (req, res) => {
  const tableName = 'latest_accn_invoice_information';
  let {
    invoice_id,
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
      invoice_information_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));

  if (result.length >= 1 && invoice_id) {
    let invoice_details = (
      await getRecords(
        'latest_accn_invoice_transaction_items',
        `where invoice_number = '${result[0].invoice_number}'  AND status="ACTIVE"`,
      )
    ).result;
    result[0].invoice_details = invoice_details;

    let payment_details = (
      await getRecords(
        'latest_accn_invoice_payment_transaction_items',
        `where invoice_id = '${result[0].invoice_id}'  AND status="ACTIVE"`,
      )
    ).result;
    result[0].payment_details = payment_details;

    if (payment_details.length) {
      let amountPaid = 0;
      payment_details.map((ele) => (amountPaid += ele.payment_paid));
      result[0].amount_due = result[0].total_due_dollar - amountPaid;
      result[0].amount_paid = amountPaid;
    }
  }
  return res.json(
    responser(
      'Invoice and Payment Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccnTransactionReport = async (req, res) => {
  let {
    from_date,
    to_date,
    type,
    sub_type,
    general_ledger_report,
    order_by = 'invoice_date',
    view,
    customer_name = [],
    policy_number = [],
    producer_one_code = [],
    branch_code = [],
    csr_code = [],
    insurer_code = [],
    line_of_business = [],
    transaction_type = [],
    payment_method = [],
    policy_type = [],
    policy_transaction_type = [],
    agency_or_direct_bill = [],
    policy_status = [],
    effective_date = [],
    vendor = [],
    vendor_type = [],
    payment_terms = [],
    category = [],
    gl_account = [],
    fields_to_exports = [],
  } = req.body;
  let finalResult = [];

  // let table_name=null,amountField=null,primaryKey=null,orderByOn=null;
  // switch(type){
  //   case "AR":
  //     table_name= "latest_accn_invoice_payment_transaction_items";
  //     amountField = "payment_paid";
  //     primaryKey="accn_invoice_payment_transaction_items_id";
  //     orderByOn="invoice_id";
  //     break;
  //   case "AP":
  //     table_name= "latest_accn_bill_transaction_items";
  //     amountField = "final_amount";
  //     primaryKey="accn_bill_transaction_items_id";
  //     orderByOn=vendor?"bill_id":"vendor";
  //     break;
  //   case "GL":
  //     break;
  //   default:
  //     throwError(404,"Invalid Type!");
  // }

  let {
    table_name = null,
    amountField = null,
    primaryKey = null,
    orderByOn = null,
  } = getValuesForTransactionReport(type, sub_type, { vendor });

  if (!table_name) throwError(404, `Table name not found for type ${type}!`);

  let filter = ' WHERE 1=1 ';
  let producer_field = 'producer_one_code';
  if (type === 'GL') {
    if (sub_type === 'producer') {
      producer_field = 'producer_code';
    }
  }
  let filterFields = [
    { key: 'name', value: customer_name },
    { key: 'policy_number', value: policy_number },
    { key: `${producer_field}`, value: producer_one_code },
    { key: 'branch_code', value: branch_code },
    { key: 'csr_code', value: csr_code },
    { key: 'insurer_code', value: insurer_code },
    { key: 'line_of_business', value: line_of_business },
    { key: 'transaction_type', value: transaction_type },
    { key: 'payment_method', value: payment_method },
    { key: 'policy_type', value: policy_type },
    { key: 'policy_transaction_type', value: policy_transaction_type },
    { key: 'agency_or_direct_bill', value: agency_or_direct_bill },
    { key: 'policy_status', value: policy_status },
    { key: 'effective_date', value: effective_date },
    { key: 'vendor', value: vendor },
    { key: 'vendor_type', value: vendor_type },
    { key: 'payment_terms', value: payment_terms },
    { key: 'category', value: category },
    { key: 'gl_account', value: gl_account },
  ];

  filterFields.map((ele) => {
    if (ele.value.length) {
      if (ele.value[0] !== 'All') {
        let modifiedArr = JSON.stringify(ele.value).replace(/^\[|]$/g, '');
        filter += `AND ${ele.key} in (${modifiedArr}) `;
      }
    }
  });

  if (from_date && to_date)
    filter += `AND insert_ts>='${from_date} 00:00:00' AND insert_ts<='${to_date} 23:59:59' `;

  if (type === 'GL') {
    let { columnList, filterCondition } = getColumnAndFilterConditionForGl({
      fields_to_exports,
      sub_type,
      filter,
      order_by,
      general_ledger_report,
    });

    let result =
      sub_type === 'producer'
        ? await dbRequest(filterCondition)
        : await getRecords(table_name, filterCondition, null, columnList);
    if (!result) return res.status(500).json(responser(errMsg));
    finalResult = result;
  } else {
    // let column_list = [
    //     `${fields_to_exports.length? fields_to_exports.toString(): "t.*"}`,
    //     `CASE
    //         WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 0 AND 30 THEN t.${amountField}
    //         ELSE 0
    //     END AS 'zero_to_thirty_days'`,
    //     `CASE
    //         WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 31 AND 60 THEN t.${amountField}
    //         ELSE 0
    //     END AS 'thirty_one_to_sixty_days'`,
    //     `CASE
    //         WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 61 AND 90 THEN t.${amountField}
    //         ELSE 0
    //     END AS 'sixty_one_to_ninety_days'`,
    //     `CASE
    //         WHEN DATEDIFF(NOW(), t.insert_ts) > 90 THEN t.${amountField}
    //         ELSE 0
    //     END AS 'over_ninety_days'`,
    //     `SUM(t.${amountField}) OVER (PARTITION BY t.${orderByOn} ORDER BY t.${primaryKey}) AS balance`
    //   ];

    let { columnList, filterCondition } = getColumnAndFilterConditionForArORAp({
      fields_to_exports,
      amountField,
      orderByOn,
      primaryKey,
      filter,
    });

    let result = await getRecords(
      table_name,
      filterCondition,
      null,
      columnList,
    );
    if (!result) return res.status(500).json(responser(errMsg));
    finalResult = result;
  }

  if (!finalResult.length) throwError(404, 'No Data found!');

  let first_sum = (second_sum = third_sum = fourth_sum = fifth_sum = 0);

  finalResult.map((ele) => {
    first_sum += parseInt(ele.zero_to_thirty_days);
    second_sum += parseInt(ele.thirty_one_to_sixty_days);
    third_sum += parseInt(ele.sixty_one_to_ninety_days);
    fourth_sum += parseInt(ele.over_ninety_days);
    fifth_sum += parseInt(ele.balance);
  });
  let total_amount_sum = {
    zero_to_thirty_days: first_sum,
    thirty_one_to_sixty_days: second_sum,
    sixty_one_to_ninety_days: third_sum,
    over_ninety_days: fourth_sum,
    balance: fifth_sum,
  };

  let filteredResult = finalResult;
  if (fields_to_exports.length) {
    if (type === 'GL') fields_to_exports.push('credit', 'debit');
    else
      fields_to_exports.push(
        'zero_to_thirty_days',
        'thirty_one_to_sixty_days',
        'sixty_one_to_ninety_days',
        'over_ninety_days',
        'balance',
      );
    if (type === 'AR' || type === 'AP') {
      filteredResult = finalResult.map((obj) => {
        return Object.keys(obj)
          .filter((key) => fields_to_exports.includes(key)) // Keep only keys in fields
          .reduce((acc, key) => {
            acc[key] = obj[key]; // Build new object with filtered keys
            return acc;
          }, {});
      });
    } else if (type === 'GL') {
      filteredResult = finalResult.map((obj) => {
        return fields_to_exports.reduce((acc, key) => {
          if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key]; // Add key-value in the correct sequence
          }
          return acc;
        }, {});
      });
    }
  }

  let finalData = { filteredResult, total_amount_sum };

  // Convert the JSON to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(finalData.filteredResult);
  // Create a new workbook and add the worksheet to it
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Convert the workbook to a buffer
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  // Write the workbook to a file
  // XLSX.writeFile(workbook, 'output.xlsx');

  console.log('Excel file created successfully!');

  let accn_transaction_report_history_code = generateCode();
  let file_path = await uploadService({
    module_name: 'ACCOUNTING',
    as_payload: {
      invoice_id: accn_transaction_report_history_code,
    },
    files: [
      {
        data: buffer,
        name: `${type}_${sub_type}.xlsx`,
      },
    ],
  });
  req.body.accn_transaction_report_history_uuid = v4();
  await insertRecords('accn_transaction_report_history', {
    ...req.body,
    accn_transaction_report_history_code,
    attachment: file_path[0],
    create_ts: setDateTimeFormat('timestemp'),
  });

  return res.json(
    responser('Transaction Reports Records', {
      ...req.body,
      attachment: file_path[0],
    }),
  );
};

exports.getAccnTransactionReport = async (req, res) => {
  const tableName = 'accn_transaction_report_history';
  let {
    accn_transaction_report_history_code,
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
      accn_transaction_report_history_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));

  if (
    result.length > 0 &&
    accn_transaction_report_history_code &&
    result[0].type !== 'GL'
  )
    result[0].fields_to_exports.splice(-5);
  else if (
    result.length > 0 &&
    accn_transaction_report_history_code &&
    result[0].type === 'GL'
  )
    result[0].fields_to_exports.splice(-2);

  return res.json(
    responser(
      'Transaction report Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};
exports.getReportFieldsToExports = async (req, res) => {
  const { type, sub_type = null, general_ledger_report = null } = req.query;

  if (!type) throwError(400, 'Type is required!');
  else if (type === 'GL' && (!sub_type || !general_ledger_report))
    throwError(400, 'sub_type, general_ledger_report are required fields!');

  let columnList = [];
  if (type === 'GL') {
    if (sub_type === 'insurer') {
      columnList = [
        `invoice_date`,
        `invoice_number`,
        `insurer_code`,
        `name`,
        `policy_transaction_type`,
        `branch_code`,
        `agency_or_direct_bill`,
        `insurer_name`,
      ];
      if (general_ledger_report === 'agency_bill_trust_payable_code')
        columnList.push('agency_bill_trust_payable_g_or_l_code');
      else if (general_ledger_report === 'agency_bill_revenue_code')
        columnList.push('agency_bill_revenue_g_or_l_code');
      else if (general_ledger_report === 'direct_bill_trust_payable_code')
        columnList.push('direct_bill_revenue_g_or_l_code');
      else if (general_ledger_report === 'direct_bill_receivable_code')
        columnList.push('direct_bill_receivable_g_or_l_code');
    } else if (
      sub_type === 'producer' &&
      (general_ledger_report === 'commission_liability_code' ||
        general_ledger_report === 'commission_expense_code')
    ) {
      columnList = [
        `invoice_date`,
        `invoice_number`,
        `insurer_code`,
        `name`,
        `policy_transaction_type`,
        `branch_code`,
        `agency_or_direct_bill`,
        `${general_ledger_report}`,
        `producer_code`,
        `producer_name`,
      ];
    } else if (
      sub_type === 'branch' &&
      general_ledger_report === 'sales_commission_account'
    ) {
      columnList = [
        `invoice_date`,
        `invoice_number`,
        `insurer_code`,
        `name`,
        `policy_transaction_type`,
        `branch_code`,
        `agency_or_direct_bill`,
        `producer_one_code`,
        `producer_two_code`,
        `producer_three_code`,
      ];
    } else if (
      sub_type === 'customer' &&
      general_ledger_report === 'customer_receivable'
    ) {
      columnList = [
        `invoice_date`,
        `invoice_number`,
        `insurer_code`,
        `name`,
        `policy_transaction_type`,
        `branch_code`,
        `agency_or_direct_bill`,
        `producer_three_code`,
      ];
    } else throwError(400, 'Invalid Sub Type or GL report!');

    return res.json(
      responser(
        'Column List',
        columnList,
        columnList.length,
        columnList.length,
      ),
    );
  }

  let tableName =
    type === 'AR'
      ? 'accn_invoice_payment_transaction_items'
      : type === 'AP'
        ? 'accn_bill_transaction_items'
        : null;
  if (!tableName) throwError(400, 'Invalid Type!');

  columnList = await getTableColumnsNames(tableName, null, {
    columnsInArray: true,
  });

  return res.json(
    responser('Column List', columnList, columnList.length, columnList.length),
  );
};

exports.getAccnInvoiceTransactionTypeAmountSum = async (req, res) => {
  const tableName = 'latest_accn_invoice_transaction_items';
  let { transaction_type } = req.query,
    whereCondition = '';
  if (transaction_type) {
    whereCondition = `where transaction_type = '${transaction_type}'`;
    let checkTransactionType = await getRecords(
      'latest_accn_transaction_type',
      whereCondition,
    );
    if (!checkTransactionType.result.length)
      return res.status(404).json(responser('Transaction Type Not found!'));
  }
  let totalRecords = await getCountRecord(tableName, whereCondition);
  let result = await getRecords(
    tableName,
    `${whereCondition} GROUP BY transaction_type`,
    null,
    ['transaction_type', 'SUM(amount) as amount'],
  );
  // if (!result.result.length)
  //   return res.status(404).json(responser('Data Not found!'));
  // result = result.result;

  return res.json(
    responser(
      'Amount sum based on transaction type',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccountInvoiceTemplate = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_invoice_template_uuid) {
    if (!req.body.accn_invoice_template_code) {
      req.body.accn_invoice_template_code = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_invoice_template',
      [' accn_invoice_template_code'],
      [req.body.accn_invoice_template_code],
    );
    if (isExist) {
      return throwError(406, 'Template Code already exists.');
    }

    req.body.accn_invoice_template_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_invoice_template',
        filterFunctionality({
          accn_invoice_template_uuid: req.body.accn_invoice_template_uuid,
        }),
      )
    )[0];

    // If the record exists, proceed with update
    if (!oldRecord) throwError(406, 'Invalid Invoive Template.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_invoice_template', req.body, [
    'accn_invoice_template_code',
    'incremental_number',
  ]);

  const result = await insertRecordHandleIncremental(
    'accn_invoice_template',
    'incremental_number',
    'accn_invoice_template_code',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_invoice_template',
    'accn_invoice_template_code',
    'accn_invoice_template',
    result.insertId,
    req.user,
  );
};
exports.getAccountInvoiceTemplate = async (req, res) => {
  const tableName = 'latest_accn_invoice_template';
  let {
    accn_invoice_template_id,
    accn_invoice_template_uuid,
    accn_invoice_template_unique_id,
    accn_invoice_template_code,
    customer_id,
    customer_policy_id,
    invoice_id,
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
      customer_id,
      accn_invoice_template_id,
      accn_invoice_template_uuid,
      accn_invoice_template_unique_id,
      accn_invoice_template_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Invoice Template Records', result, result.length, totalRecords),
  );
};

exports.editAccountTransactionType = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_transaction_type_uuid) {
    if (!req.body.transaction_type_id) {
      req.body.transaction_type_id = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_transaction_type',
      [' transaction_type_id'],
      [req.body.transaction_type_id],
    );
    if (isExist) {
      return throwError(406, 'Transation type already exists.');
    }

    req.body.accn_transaction_type_uuid = v4();
  }
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  else {
    oldRecord = (
      await getRecords(
        'accn_transaction_type',
        filterFunctionality({
          accn_transaction_type_uuid: req.body.accn_transaction_type_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Transation Type.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_transaction_type', req.body, [
    'transaction_type_id',
  ]);
  const result = await insertRecords('accn_transaction_type', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_transaction_type',
    'transaction_type_id',
    'accn_transaction_type',
    result.insertId,
    req.user,
  );
};

exports.getAccountTransactionType = async (req, res) => {
  const tableName = 'latest_accn_transaction_type';
  let {
    accn_transaction_type_id,
    accn_transaction_type_uuid,
    accn_transaction_type_unique_id,
    transaction_type_id,
    invoice_id,
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
      accn_transaction_type_id,
      accn_transaction_type_uuid,
      accn_transaction_type_unique_id,
      transaction_type_id,
      invoice_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Transaction Type Records', result, result.length, totalRecords),
  );
};

exports.editAccountTransactionDescription = async (req, res) => {
  req.body.create_ts = setDateTimeFormat('timestemp');
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  if (req.body.transaction_description_id) {
    let createTs = await getRecords(
      'accn_transaction_description',
      `where transaction_description_id = '${req.body.transaction_description_id}'`,
    );
    // if (!createTs.result.length)
    //   return res.status(404).json(responser('Not found!'));
    req.body.create_ts = setDateTimeFormat('timestemp', createTs);
  } else {
    // req.body.accn_transaction_type_uuid = v4();
    req.body.create_ts = setDateTimeFormat('timestemp');
  }
  const result = await insertRecordHandleIncremental(
    'accn_transaction_description',
    'transaction_description_id',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      result[0]
        ? result[0][0]
          ? result[0][0].msg
          : result[0].msg
        : 'Successfully Updated!',
      req.body,
    ),
  );
};

exports.getAccountTransactionDescription = async (req, res) => {
  const tableName = 'latest_accn_transaction_description';
  let {
    customer_id,
    customer_policy_id,
    transaction_description_id,
    invoice_id,
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
      customer_id,
      customer_policy_id,
      transaction_description_id,
      invoice_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Customer Social Records', result, result.length, totalRecords),
  );
};
// Bill Controllers
exports.editAccountCreateBill = async (req, res) => {
  await handleAuditColumns('accn_create_bill', req.body, ['bill_id']);

  // if (!req.body.bill_id) req.body.bill_number = generateCode({ length: 10 });
  req.body.accn_create_bill_uuid = v4();
  const result = await insertRecords('accn_create_bill', req.body);
  if (!result) return res.status(500).json(responser(errMsg));

  let maxTransactionId =
    (
      await dbRequest(
        `select max(accn_transaction_id) as maxTransactionId from accn_bill_transaction_items`,
      )
    )?.[0]?.maxTransactionId || 0;

  req.body.bill_details = await Promise.all(
    req.body.bill_details.map(async (ele) => {
      let checkRecord = (
        await getRecords(
          'accn_bill_transaction_items',
          `where customer_id = '${ele.customer_id}' and accn_transaction_id = ${ele?.accn_transaction_id || -1} limit 1`,
          null,
          ['create_ts', 'created_by_uuid'],
        )
      ).result;
      let create_ts, created_by_uuid, modified_by_uuid;
      if (checkRecord) {
        create_ts = checkRecord[0].create_ts;
        created_by_uuid = checkRecord[0].created_by_id;
        modified_by_uuid = req.user.user_fact_id;
      } else {
        create_ts = setDateTimeFormat('timestemp');
        created_by_uuid = modified_by_uuid = req.user.user_fact_id;
      }

      return {
        ...ele,
        accn_transaction_id: !ele.accn_transaction_id
          ? ++maxTransactionId
          : ele.accn_transaction_id,
        vendor: req.body.vendor,
        // code: req.body.code,
        // vendor_type: req.body.vendor_type,
        gl_sales_account_name: req.body.gl_sales_account_name,
        category: req.body.category,
        bill_date: req.body.bill_date,
        bill_id: req.body.bill_id,
        bill_type: req.body.bill_type,
        due_date: req.body.due_date,
        payment_terms: req.body.payment_terms,
        // total_due_amount: req.body.total_due_amount,
        create_ts,
        created_by_uuid,
        modified_by_uuid,
      };
    }),
  );
  req.body.accn_bill_transaction_items_uuid = v4();
  await insertRecords('accn_bill_transaction_items', req.body.bill_details);

  return res.json(responser('Successfully Updated!', req.body));
};

exports.getAccountCreateBill = async (req, res) => {
  const tableName = 'latest_accn_create_bill';
  let {
    accn_create_bill_uuid,
    accn_create_bill_unique_id,
    accn_create_bill_id,
    create_payment_primary_id,
    bill_id,
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
      accn_create_bill_uuid,
      accn_create_bill_unique_id,
      accn_create_bill_id,
      bill_id,
      create_payment_primary_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  // if(result.length>=1 && (bill_id || code)){
  //   if(bill_id){
  //     let bill_details = (await getRecords("latest_accn_bill_transaction_items",`where bill_id = '${result[0].bill_id}' AND status="ACTIVE"`)).result;
  //     result[0].bill_details = bill_details;
  //   }
  //   let billTransactionItems = (await getRecords("latest_accn_payment_payable_details", `WHERE bill_number='${result[0].bill_number}'`, null, ["payment_paid"])).result;
  //   if(billTransactionItems.length){
  //     let amountPaid=0;
  //     billTransactionItems.map(ele=>amountPaid+=ele.payment_paid);
  //     result[0].amount_due = result[0].total_due_amount - amountPaid;
  //     console.log("amount_due", result[0].amount_due);
  //     result[0].amount_paid =amountPaid;
  //   }
  // }

  if (result.length >= 1 && (bill_id || accn_create_bill_id)) {
    if (bill_id) {
      let bill_details = (
        await getRecords(
          'latest_accn_bill_transaction_items',
          filterFunctionality({
            accn_create_bill_id: req.body.accn_create_bill_id,
            status: 'ACTIVE',
          }),
        )
      )[0];
      // result[0].bill_details = bill_details;

      let billTransactionItems = (
        await getRecords(
          'latest_accn_payment_payable_details',
          `WHERE bill_number='${result[0].bill_number}'`,
          null,
          ['payment_paid'],
        )
      ).result;
      if (billTransactionItems.length) {
        let amountPaid = 0;
        billTransactionItems.map((ele) => (amountPaid += ele.payment_paid));
        result[0].amount_due = result[0].total_due_amount - amountPaid;
        result[0].amount_paid = amountPaid;
      }
    } else if (code) {
      result.map((ele) => {
        if (ele.payment_paid !== null && ele.remaining_amount_due !== null) {
          ele.amount_paid = ele.payment_paid;
          ele.amount_due = ele.remaining_amount_due;
        }
      });
    }
  }
  return res.json(
    responser('Created Bill Records', result, result.length, totalRecords),
  );
};

exports.getAccountBillAndPaymentHistory = async (req, res) => {
  const tableName = 'latest_accn_create_bill';
  let {
    bill_id,
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
      bill_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));

  if (result.length >= 1 && bill_id) {
    let bill_details = await getRecords(
      'latest_accn_bill_transaction_items',
      `where bill_id = '${result[0].bill_id}' AND status="ACTIVE"`,
    );
    result[0].bill_details = bill_details;

    let billTransactionItems = (
      await getRecords(
        'latest_accn_payment_payable_details',
        `WHERE bill_number='${result[0].bill_number}' AND status="ACTIVE"`,
      )
    ).result;
    result[0].bill_payment_details = billTransactionItems;

    if (billTransactionItems.length) {
      let amountPaid = 0;
      billTransactionItems.map((ele) => (amountPaid += ele.payment_paid));
      result[0].amount_due = result[0].total_due_amount - amountPaid;
      result[0].amount_paid = amountPaid;
    }
  }
  return res.json(
    responser('Created Bill Records', result, result.length, totalRecords),
  );
};

exports.editAccountBillTransactionItems = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_bill_transaction_items_uuid) {
    let isExist = await isRecordExist(
      'accn_bill_transaction_items',
      ['accn_bill_transaction_items_unique_id'],
      [req.body.accn_bill_transaction_items_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Company Information already exists.');
    }

    // Generate new UUID for the record
    req.body.accn_bill_transaction_items_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_bill_transaction_items',
        filterFunctionality({
          accn_bill_transaction_items_uuid:
            req.body.accn_bill_transaction_items_uuid,
        }),
      )
    )[0];

    if (!oldRecord) {
      return throwError(406, 'Invalid Account bill transaction .');
    }
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_bill_transaction_items', req.body, [
    'accn_bill_transaction_items_uuid',
  ]);
  const result = await insertRecords('accn_bill_transaction_items', req.body);
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_bill_transaction_items',
    'accn_bill_transaction_item_uuid',
    'Company Information',
    result.insertId,
    req.user,
  );
};

exports.getAccountBillTransactionItems = async (req, res) => {
  const tableName = 'latest_accn_bill_transaction_items';
  let {
    customer_id,
    accn_bill_transaction_items_id,
    accn_bill_transaction_items_unique_id,
    accn_bill_transaction_items_uuid,
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
      customer_id,
      accn_bill_transaction_items_id,
      accn_bill_transaction_items_unique_id,
      accn_bill_transaction_items_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Bill Payment Transaction Items Records',
      result,
      result.length,
      totalRecords,
    ),
  );
};

exports.editAccountBillTemplate = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_bill_template_uuid) {
    if (!req.body.accn_bill_template_code) {
      req.body.accn_bill_template_code = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_bill_template',
      ['accn_bill_template_code'],
      [req.body.accn_bill_template_code],
    );
    if (isExist) {
      return throwError(406, 'Template Code already exists.');
    }

    req.body.accn_bill_template_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_bill_template',
        filterFunctionality({
          accn_bill_template_uuid: req.body.accn_bill_template_uuid,
        }),
      )
    )[0];

    // If the record exists, proceed with update
    if (!oldRecord) throwError(406, 'Invalid Template.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_bill_template', req.body, [
    'accn_bill_template_code',
    'incremental_number',
  ]);
  const result = await insertRecordHandleIncremental(
    'accn_bill_template',
    'incremental_number',
    'accn_bill_template_code',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_bill_template',
    'accn_bill_template_code',
    'accn_bill_template',
    result.insertId,
    req.user,
  );
};
exports.getAccountBillTemplate = async (req, res) => {
  const tableName = 'latest_accn_bill_template';
  let {
    accn_bill_template_uuid,
    accn_bill_template_id,
    accn_bill_template_unique_id,
    accn_bill_template_code,
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
      accn_bill_template_uuid,
      accn_bill_template_id,
      accn_bill_template_unique_id,
      accn_bill_template_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Account Bill Templates', result, result.length, totalRecords),
  );
};

exports.editAccountCreatePayment = async (req, res) => {
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  req.body.create_ts = setDateTimeFormat('timestemp', req.body.create_ts);
  await handleAuditColumns('latest_accn_create_payment', req.body, [
    'accn_create_payment_id',
  ]);
  if (!req.body.create_payment_code)
    req.body.create_payment_code = generateCode();

  let latestCreatePayment = await getRecords(
    'latest_accn_create_payment',
    `where accn_create_payment_id= '${req.body.accn_create_payment_id}'`,
  );
  if (!latestCreatePayment)
    return throwError(404, 'Create Payment Code Not found!');
  req.body.accn_create_payment_uuid = v4();
  const result = await insertRecords('accn_create_payment', req.body);
  if (!result) return res.status(500).json(responser(errMsg));

  let maxTransactionId =
    (
      await dbRequest(
        `select max(accn_transaction_id) as maxTransactionId from accn_payment_payable_details`,
      )
    )[0]?.maxTransactionId || 0;

  req.body.bill_payment_details = await Promise.all(
    req.body.bill_payment_details.map(async (ele) => {
      let checkAmount = ele.bill_amount - ele.payment_paid,
        create_ts,
        created_by_uuid,
        modified_by_uuid;
      let is_partial_payment = 1;

      let checkRecord = (
        await getRecords(
          'accn_payment_payable_details',
          `where payment_id = '${ele.payment_id}' and accn_transaction_id = ${ele?.accn_transaction_id || -1} limit 1`,
          null,
          ['create_ts', 'created_by_uuid'],
        )
      ).result;

      if (checkRecord) {
        create_ts = checkRecord[0].create_ts;
        created_by_uuid = checkRecord[0].created_by_id;
        modified_by_uuid = req.user.user_fact_id;
      } else {
        create_ts = setDateTimeFormat('timestemp');
        created_by_uuid = modified_by_uuid = req.user.user_fact_id;
      }

      return {
        ...ele,
        accn_transaction_id: !ele.accn_transaction_id
          ? ++maxTransactionId
          : ele.accn_transaction_id,
        // create_payment_code: req.body.create_payment_code,
        create_accn_create_payment_id: req.body.accn_create_payment_id,
        vendor: req.body.vendor,
        invoice_payment_gl_account_name:
          req.body.invoice_payment_gl_account_name,
        payment_number: req.body.payment_number,
        payment_made: req.body.payment_made,
        bank_charges: req.body.bank_charges,
        payment_method: req.body.payment_method,
        paid_through_account: req.body.paid_through_account,
        create_ts,
        created_by_uuid,
        modified_by_uuid,
        is_partial_payment: checkAmount === 0 ? 0 : is_partial_payment,
      };
    }),
  );
  req.body.accn_payment_payable_details_uuid = v4();
  await insertRecords(
    'accn_payment_payable_details',
    req.body.bill_payment_details,
  );
  return res.json(responser('Successfully Updated!', req.body));
};

exports.getAccountCreatePayment = async (req, res) => {
  const tableName = 'latest_accn_create_payment';
  let {
    accn_create_payment_id,
    accn_create_payment_unique_id,
    accn_create_payment_uuid,
    payment_id,
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
      accn_create_payment_id,
      accn_create_payment_unique_id,
      accn_create_payment_uuid,
      payment_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  if (result.length === 1 && (payment_id || accn_create_payment_id)) {
    let bill_payment_details = (
      await getRecords(
        'latest_accn_payment_payable_details',
        // `where accn_create_payment_id = '${result[0].create_payment_code}' AND status="ACTIVE"`,
        filterFunctionality({
          accn_create_payment_id: req.body.accn_create_payment_id,
          status: 'ACTIVE',
        }),
      )
    )[0];
    // result[0].bill_payment_details = bill_payment_details;

    result[0].bill_payment_details = bill_payment_details.map((ele) => {
      return {
        ...ele,
        bill_amount: ele.total_due_dollar,
      };
    });
  }
  return res.json(
    responser('Created Payment Records', result, result.length, totalRecords),
  );
};

exports.editAccountBankAccount = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_bank_account_uuid) {
    if (!req.body.bank_account_code) {
      req.body.bank_account_code = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_bank_account',
      ['bank_account_code'],
      [req.body.bank_account_code],
    );
    if (isExist) {
      return throwError(406, 'Template Code already exists.');
    }

    req.body.accn_bank_account_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_bank_account',
        filterFunctionality({
          accn_bank_account_uuid: req.body.accn_bank_account_uuid,
        }),
      )
    )[0];

    if (!oldRecord) throwError(406, 'Invalid Bank Account.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_bank_account', req.body, [
    ' bank_account_code',
  ]);

  const result = await insertRecords('accn_bank_account', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_bank_account',
    'bank_account_code',
    'accn_bank_account',
    result.insertId,
    req.user,
  );
};

exports.getAccountBankAccount = async (req, res) => {
  const tableName = 'latest_accn_bank_account';
  let {
    accn_bank_account_unique_id,
    accn_bank_account_id,
    accn_bank_account_uuid,
    customer_id,
    customer_policy_id,
    bank_account_code,
    incremental_number,
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
      accn_bank_account_unique_id,
      accn_bank_account_id,
      accn_bank_account_uuid,
      bank_account_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Bank Account Records', result, result.length, totalRecords),
  );
};

exports.editAccountCheque = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_cheque_uuid) {
    let isExist = await isRecordExist(
      'accn_cheque',
      ['accn_cheque_uuid'],
      [req.body.accn_cheque_uuid],
    );
    if (isExist) {
      return throwError(406, 'Template Code already exists.');
    }

    req.body.accn_cheque_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_cheque',
        filterFunctionality({ accn_cheque_uuid: req.body.accn_cheque_uuid }),
      )
    )[0];

    // If the record exists, proceed with update
    if (!oldRecord) throwError(406, 'Invalid Invoive Template.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_cheque', req.body, [
    ' accn_cheque_uuid',
  ]);

  const result = await insertRecords('accn_cheque', req.body);
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_cheque',
    'accn_cheque_uuid',
    'accn_cheque',
    result.insertId,
    req.user,
  );
};

exports.getAccountCheque = async (req, res) => {
  const tableName = 'latest_accn_cheque';
  let {
    accn_cheque_unique_id,
    accn_cheque_id,
    accn_cheque_uuid,
    customer_policy_id,
    payment_id,
    cheque_number,
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
      accn_cheque_unique_id,
      accn_cheque_id,
      accn_cheque_uuid,
      customer_policy_id,
      payment_id,
      cheque_number,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Account Cheque Records', result, result.length, totalRecords),
  );
};

exports.editAccountVendor = async (req, res) => {
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_vendor_uuid) {
    if (!req.body.vendor_code) {
      req.body.vendor_code = generateCode();
    }

    let isExist = await isRecordExist(
      'accn_vendor',
      ['vendor_code'],
      [req.body.vendor_code],
    );
    if (isExist) {
      return throwError(406, 'Template Code already exists.');
    }

    req.body.accn_vendor_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_vendor',
        filterFunctionality({ accn_vendor_uuid: req.body.accn_vendor_uuid }),
      )
    )[0];

    // If the record exists, proceed with update
    if (!oldRecord) throwError(406, 'Invalid Invoive Template.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_accn_vendor', req.body, ['vendor_code']);

  const result = await insertRecords('accn_vendor', req.body);
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_vendor',
    'vendor_code',
    'accn_vendor',
    result.insertId,
    req.user,
  );
};

exports.getAccountVendor = async (req, res) => {
  const tableName = 'latest_accn_vendor';
  let {
    accn_vendor_id,
    accn_vendor_unique_id,
    accn_vendor_uuid,
    vendor_code,
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
      accn_vendor_id,
      accn_vendor_unique_id,
      accn_vendor_uuid,
      vendor_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Account Vendor', result, result.length, totalRecords),
  );
};

exports.editAccountSystemGlAccount = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.accn_system_gl_account_uuid) {
    // let isExist = await isRecordExist(
    //   'accn_invoice_template',
    //   [' accn_invoice_template_code'],
    //   [req.body.accn_invoice_template_code]
    // );
    // if (isExist) {
    //   return throwError(406, 'Template Code already exists.');
    // }

    req.body.accn_system_gl_account_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'accn_system_gl_account',
        filterFunctionality({
          ccn_system_gl_account_uuid: req.body.ccn_system_gl_account_uuid,
        }),
      )
    )[0];

    // If the record exists, proceed with update
    if (!oldRecord) throwError(406, 'Invalid Gl Accounts.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  // await isEditAccess('latest_customer_all_detailed_record', req.user);
  await handleAuditColumns('latest_accn_system_gl_account', req.body, [
    'accn_system_gl_account_unique_id',
    'incremental_number',
  ]);

  // if (!req.body.accn_system_gl_account_unique_id) {
  //   let id =
  //     (
  //       await dbRequest(
  //         `select max(accn_system_gl_account_id) as maxId FROM accn_system_gl_account`,
  //       )
  //     ).result[0].maxId || 0;
  //   req.body.accn_system_gl_account_unique_id = id + 1;
  // }

  const result = await insertRecordHandleIncremental(
    'accn_system_gl_account',
    'incremental_number',
    'accn_system_gl_account_unique_id',
    req.body,
  );
  if (!result) return res.status(500).json(responser(errMsg));
  res.json(responser('Successfully Updated!', req.body));
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'accn_system_gl_account',
    'accn_system_gl_account_uuid',
    'accn_system_gl_account',
    result.insertId,
    req.user,
  );
};

exports.getAccountSystemGlAccount = async (req, res) => {
  const tableName = 'latest_accn_system_gl_account';
  let {
    accn_system_gl_account_id,
    accn_system_gl_account_unique_id,
    accn_system_gl_account_uuid,
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
      accn_system_gl_account_id,
      accn_system_gl_account_unique_id,
      accn_system_gl_account_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );

  // filter = await roleFilterService(filter,"latest_customer_all_detailed_record",req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(
      'Customer Social Records',
      result,
      result.length,
      totalRecords.result,
    ),
  );
};
