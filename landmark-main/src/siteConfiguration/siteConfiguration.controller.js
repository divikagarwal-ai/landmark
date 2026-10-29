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
  environmentConfigurationService,
} = require('../../utils/dbFunctions');

const {
  responser,
  //   readFileContent,
  decipherDecryption,
  cipherEncryption,
  throwError,
  setDateTimeFormat,
  getData,
  deleteKeyValuePair,
  removeNullValueKey,

  requestApi,
  // calculateAge
} = require('../../utils/helperFunction');

const { v4 } = require('uuid');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');

// const { S3_PUBLIC_PREFIX_URL } = require('../../config/server.config');

exports.upsertCompanyInformation = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};
  if (!req.body.company_uuid) {
    let isExist = await isRecordExist(
      'company_information',
      ['company_information_unique_id'],
      [req.body.company_information_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Information already exists.');
    }

    req.body.company_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'company_information',
        filterFunctionality({
          company_uuid: req.body.company_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Information.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_company_information', req.body, [
    'company_uuid',
  ]);
  const result = await insertRecords('company_information', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Compnay Information has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'company_information',
    'company_uuid',
    'company_information',
    result.insertId,
    req.user,
  );
};

exports.getCompanyInformation = async (req, res) => {
  const {
    company_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_company_information';
  let filter = filterFunctionality(
    {
      company_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );

  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  // let result = await getRecords(tableName, filter, pageFilter, null, {
  //   includeUniqueId: false,
  // });
  const S3_PUBLIC_PREFIX_URL = (
    await environmentConfigurationService(['S3_PUBLIC_PREFIX_URL'])
  )?.S3_PUBLIC_PREFIX_URL;
  let result = await dbRequest(
    `SELECT *, 
        CASE 
            WHEN logo IS NOT NULL AND logo <> '' 
            THEN concat('${S3_PUBLIC_PREFIX_URL}', logo) 
            ELSE NULL 
        END AS preview_logo, 
        CASE 
            WHEN fav_icon IS NOT NULL AND fav_icon <> '' 
            THEN concat('${S3_PUBLIC_PREFIX_URL}', fav_icon)
            ELSE NULL 
        END AS preview_fav_icon,
        adsense_header_code
        FROM ${tableName} ${filter} ${pageFilter}`,
  );
  return res.json(
    responser('Company Information: ', result, result.length, totalRecords),
  );
};
exports.getPublicCompanyInformation = async (req, res) => {
  const tableName = 'latest_company_information';
  const S3_PUBLIC_PREFIX_URL = (
    await environmentConfigurationService(['S3_PUBLIC_PREFIX_URL'])
  )?.S3_PUBLIC_PREFIX_URL;
  let result = await dbRequest(
    ` SELECT company_name, 
        CASE 
            WHEN logo IS NOT NULL AND logo <> '' 
            THEN concat('${S3_PUBLIC_PREFIX_URL}', logo) 
            ELSE NULL 
        END AS preview_logo, 
        CASE 
            WHEN fav_icon IS NOT NULL AND fav_icon <> '' 
            THEN concat('${S3_PUBLIC_PREFIX_URL}', fav_icon)
            ELSE NULL 
        END AS preview_fav_icon,
        company_title,
        company_description,
        adsense_header_code 
        FROM ${tableName}`,
  );
  if (!result) return throwError(500, result);
  return res.json(
    responser(
      'Company Information Record',
      result,
      result.length,
      result.length,
    ),
  );
};

// Environment Configuration
exports.upsertEnvironmentConfiguration = async (req, res) => {
  removeNullValueKey(req.body);
  if (req.body.environment_configuration_uuid) {
    let environment_configuration_info = await getRecords(
      'latest_environment_configuration',
      `where environment_configuration_uuid='${req.body.environment_configuration_uuid}'`,
    );
    if (!environment_configuration_info.length)
      throwError(404, 'environment_configuration_info not found.');
    environment_configuration_info = environment_configuration_info[0];
    if (req.body.env_key !== environment_configuration_info.env_key) {
      let isKeyExists = await isRecordExist(
        'latest_environment_configuration',
        ['env_key'],
        [req.body.env_value],
      );
      if (isKeyExists) throwError(409, 'Key already exists.');
    }
    req.body = { ...environment_configuration_info, ...req.body };
  } else {
    let isKeyExists = await isRecordExist(
      'latest_environment_configuration',
      ['env_key'],
      [req.body.env_value],
    );
    if (isKeyExists) throwError(409, 'Key already exists.');
    req.body.create_ts = setDateTimeFormat('timestemp');
    req.body.environment_configuration_uuid = v4();
  }

  let payload = req.body;
  if (req.body.is_encrypted === '1')
    payload = {
      ...payload,
      env_value: cipherEncryption(req.body.env_value),
    };

  await handleAuditColumns('latest_environment_configuration', req.body, [
    'environment_configuration_uuid',
  ]);
  await insertRecords('environment_configuration', payload);

  res.json(
    responser('Environment Configuration created successfully.', req.body),
  );
};

exports.getEnvironmentConfiguration = async (req, res) => {
  const {
    environment_configuration_id,
    environment_configuration_uuid,
    module_code,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_environment_configuration';
  let filter = filterFunctionality(
    {
      environment_configuration_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );

  let pageFilter = pagination(pageNo, itemPerPage);
  // let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  console.log('result: ', result);
  if (result.length === 1 && environment_configuration_uuid) {
    result[0].env_value = decipherDecryption(result[0].env_value);
  }
  return res.json(
    responser('Environment Configuration', result, result.length),
  );
};
