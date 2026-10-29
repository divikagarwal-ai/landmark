const {
  dbRequest,
  dataStringForSQL,
  parseRequestParams,
  responser,
  generateCode,
  throwError,
  setDateTimeFormat,
  deleteKeyValuePair,
} = require('../../utils/helperFunction');
const {
  isRecordExist,
  filterFunctionality,
  insertRecords,
  getRecords,
  getCountRecord,
  roleFilterService,
  insertRecordHandleIncremental,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');

const {
  getUserProfileWithEveryIdUSerCode,
} = require('../user/user.controller');

exports.checkCustomerProspectDetailsCustomerCodeService = async (payload) => {
  return await getRecords(
    'latest_customer_prospect_details',
    filterFunctionality({ customer_code: payload.customer_code }),
  );
};

exports.updateSecondaryContact = async (name, data) => {
  let email = data.email;
  let customer_id = data.customer_id;
  delete data.email;
  delete data.customer_id;
  delete data.isCrmUserEntering;
  let subSql = Object.keys(data)
    .map((column) => `${column}='${data[column]}'`)
    .toString();
  return dbRequest(
    `UPDATE ${name} SET ${subSql} WHERE customer_id='${customer_id}' AND email='${email}'`,
  );
};

exports.getCustomerIdFromPolicForValidUser = async (
  customer_policy_id,
  selfUser,
) => {
  if (!customer_policy_id) throwError(406, 'Customer policy id is required');
  let policy_id = (
    await getRecords(
      'customer_policy_fact',
      `where customer_policy_id=${customer_policy_id}`,
    )
  ).result[0].policy_id;
  let policy = (await getRecords('policy', `where policy_id=${policy_id}`))
    .result[0].policy_type;
  let tableName;
  let filter;
  switch (policy) {
    case 'Business Policy':
      tableName = 'latest_policy_business_customer_info';
      filter = await roleFilterService(
        `WHERE customer_policy_id=${customer_policy_id}`,
        tableName,
        selfUser,
      );
      return (await getRecords(tableName, filter)).result[0];

    case 'Habitational Policy':
      tableName = 'latest_policy_habitational_customer_info';
      filter = await roleFilterService(
        `WHERE customer_policy_id=${customer_policy_id}`,
        tableName,
        selfUser,
      );
      return (await getRecords(tableName, filter)).result[0];

    case 'Commercial Auto Policy':
      tableName = 'latest_policy_commauto_customer_info';
      filter = await roleFilterService(
        `WHERE customer_policy_id=${customer_policy_id}`,
        tableName,
        selfUser,
      );
      return (await getRecords(tableName, filter)).result[0];

    case 'Life & Fincancial Policy':
      tableName = 'latest_policy_life_basic_details_customer_info';
      filter = await roleFilterService(
        `WHERE customer_policy_id=${customer_policy_id}`,
        tableName,
        selfUser,
      );
      return (await getRecords(tableName, filter)).result[0];

    case 'Automobile Policy':
      tableName = 'latest_policy_automobile_customer_info';
      filter = await roleFilterService(
        `WHERE customer_policy_id=${customer_policy_id}`,
        tableName,
        selfUser,
      );
      return (await getRecords(tableName, filter)).result[0];
  }
};
