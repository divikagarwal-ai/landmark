const {
  insertRecords,
  getCountRecord,
  getRecords,
  isRecordExist,
  getAllTemplatesService,
  isEditAccess,
  roleFilterService,
  handleAuditColumns,
  filterFunctionality,
  getTableColumnsNames,
  pagination,
  dbRequest,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');
const {
  renderTemplateService,
  getEmailBodyByTemplateMapping,
} = require('./template.service');
const {
  sendEmailService,
  saveHistory,
  getWhatsappExotelTemplateService,
  createWhatsappExotelTemplateService,
} = require('../../utils/microservice_func');
const {
  responser,
  throwError,
  generateCode,
  removeNullValueKey,
  deleteKeyValuePair,
  isTableViewColumnExist,
  // getTableColumnsNames,
  requestApi,
} = require('../../utils/helperFunction');

exports.createTemplates = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  await isEditAccess('latest_templates', req.user);
  if (!req.body.templates_uuid) {
    if (!req.body.template_code) {
      req.body.template_code = generateCode({ length: 6 });
    }

    let isExist = await isRecordExist(
      'templates',
      ['templates_unique_id'],
      [req.body.templates_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Stdent already exists.');
    }

    req.body.templates_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'templates',
        filterFunctionality({
          templates_uuid: req.body.templates_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Groups.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_templates', req.body, ['template_code']);
  const result = await insertRecords('templates', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Templates has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'templates',
    'templates_uuid',
    'templates',
    result.insertId,
    req.user,
  );

  // let isTableExist = await isTableViewColumnExist(req.body.table_name);
  // if(!isTableExist) throwError(400,`Invalid View ${req.body.table_name}`);
  // if(req.body.template_code){
  //   let template = (await getRecords("latest_templates",`where template_code="${req.body.template_code}"`)).result[0];
  //   if(!template) throwError(400,"Invalid template.");
  //   req.body = {...template,...req.body};
  // }else req.body.template_code = generateCode({length:6});
  // await handleAuditColumns("templates",req.body,["template_code"])
  // await insertRecords("templates", req.body);
  // res.json(responser("Successfully Updated!", req.body));
};

exports.getTemplates = async (req, res) => {
  const tableName = 'latest_templates';
  const {
    templates_id,
    templates_uuid,
    templates_unique_id,
    template_code,
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
      templates_id,
      templates_uuid,
      templates_unique_id,
      template_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser(' unit_groups', result, result.length, totalRecords),
  );
};

exports.renderTemplate = async (req, res) => {
  const { template_code, payload } = req.body;
  let html = await renderTemplateService(template_code, payload);
  res.json(responser('Template', html));
};

exports.upsertEmailBodyByTemplateMapping = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  await isEditAccess('latest_template_module_mapping', req.user);
  if (!req.body.template_module_mapping_uuid) {
    if (!req.body.template_module_mapping_code) {
      req.body.template_module_mapping_code = generateCode({ length: 10 });
    }

    let isExist = await isRecordExist(
      'template_module_mapping',
      ['template_module_mapping_unique_id'],
      [req.body.template_module_mapping_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Module already exists.');
    }

    req.body.template_module_mapping_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'template_module_mapping',
        filterFunctionality({
          template_module_mapping_uuid: req.body.template_module_mapping_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Mapping.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  // console.log("Processing UUID:", template_module_mapping_uuid);
  await handleAuditColumns('latest_template_module_mapping', req.body, [
    'template_module_mapping_uuid',
  ]);
  const result = await insertRecords('template_module_mapping', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Templates has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
};

exports.getTemplateDynamicView = async (req, res) => {
  const tableName = 'latest_template_module_mapping';

  let result = await getEmailBodyByTemplateMapping(req.body);

  return res.json(responser('template modules', result, totalRecords));
};

exports.getTemplateDynamicView = async (req, res) => {
  const tableName = 'latest_templates_dynamic_views';
  const {
    templates_dynamic_views_code,
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
      templates_dynamic_views_code,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  deleteKeyValuePair(result, [
    'templates_dynamic_views_id',
    'templates_dynamic_views_uuid',
    'view_sql',
    'status',
    'created_by_uuid',
    'created_by_name',
    'modified_by_uuid',
    'modified_by_name',
    'create_ts',
    'insert_ts',
  ]);

  return res.json(
    responser(
      'template views and columns',
      result,
      result.length,
      totalRecords,
    ),
  );
};

// exports.getSqlViewOrColumns = async(req,res)=>{
//   const {templates_dynamic_views_code} = req.query;
//   let result = [];
//   if(templates_dynamic_views_code){
//     let templateSqlView = (await getRecords("latest_templates_dynamic_views",`where templates_dynamic_views_code="${templates_dynamic_views_code}"`));
//     if(!templateSqlView) throwError(400,"Invalid View");
//     console.log("view===>",templateSqlView.view_sql);
//     const regex = /(?<=SELECT\s+)([\s\S]*?)(?=\s+FROM)/i;
//     const match = templateSqlView.view_sql.match(regex);
//     if (match) {
//       let selectPart = match[0];
//       const columnRegex = /\b([a-zA-Z_]+\.[a-zA-Z_]+)\b/g;

//       let columnMatch;
//       // Extract all column names that match the dot notation (e.g., user_session.user_fact_id)
//       while ((columnMatch = columnRegex.exec(selectPart)) !== null) {
//         result.push(columnMatch[1]);
//       }
//     }
//   }else{
//     result = (await getRecords("latest_templates_dynamic_views",null,null,["view_for","templates_dynamic_views_code"])).result;
//   }
//   res.json(responser("Columns or views list",result));
// }

exports.generateSqlView = async (req, res) => {
  removeNullValueKey(req.body);
  let isUpdate = false;
  let oldRecord = {};

  if (!req.body.templates_dynamic_views_uuid) {
    if (!req.body.templates_dynamic_views_code) {
      req.body.templates_dynamic_views_code = generateCode({ length: 10 });
    }

    let isExist = await isRecordExist(
      'templates_dynamic_views',
      ['templates_dynamic_views_unique_id'],
      [req.body.templates_dynamic_views_unique_id],
    );
    if (isExist) {
      return throwError(406, 'Dynamic views already exists.');
    }

    req.body.templates_dynamic_views_uuid = v4();
  } else {
    oldRecord = (
      await getRecords(
        'templates_dynamic_views',
        filterFunctionality({
          templates_dynamic_views_uuid: req.body.templates_dynamic_views_uuid,
        }),
      )
    )[0];
    if (!oldRecord) throwError(406, 'Invalid Groups.');
    req.body = { ...oldRecord, ...req.body };
    isUpdate = true;
  }
  await handleAuditColumns('latest_templates_dynamic_views', req.body, [
    'templates_dynamic_views_code',
  ]);
  const result = await insertRecords('templates_dynamic_views', req.body);
  // if (!result) return res.status(500).json(responser(errMsg));
  res.json(
    responser(
      `Templates has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      req.body,
    ),
  );
  // saveHistory(
  //   {
  //     oldRecord,
  //     newRecord: req.body,
  //   },
  //   'templates_dynamic_views',
  //   'templates_dynamic_views_uuid',
  //   'templates_dynamic_views',
  //   result.insertId,
  //   req.user,
  // );

  // if(req.body.templates_dynamic_views_code){
  //   let templateSqlView = (await getRecords("latest_templates_dynamic_views",
  //   `where templates_dynamic_views_code="${req.body.templates_dynamic_views_code}"`)).result[0];
  //   if(!templateSqlView) throwError(400,"Invalid View");
  //   req.body = {...templateSqlView,...req.body};
  // }else req.body.templates_dynamic_views_code = generateCode({length:10});
  // await handleAuditColumns("latest_templates_dynamic_views",req.body,["templates_dynamic_views_code"]);
  // await insertRecords("templates_dynamic_views",req.body);
  // res.json(responser("Successfully Updated!", req.body));
};

exports.getTableNameOrColumnName = async (req, res) => {
  const { table_name, table_type } = req.query;
  const result = [];
  if (table_name) {
    const columnName = await dbRequest(
      `SELECT column_name FROM information_schema.columns WHERE table_schema =  DATABASE() AND table_name = '${table_name}'`,
    );
    console.log('columnName', columnName);
    if (!columnName.length) throwError(404, 'Table not found in database');

    const primaryKey = await getTableColumnsNames(table_name, [0]);
    if (!primaryKey) throwError(500);

    const valuesToDelete = ['insert_ts', 'create_ts'];
    if (!table_name.includes('latest_'))
      valuesToDelete.push(primaryKey.replace(/`/g, ''));
    const filteredResult = columnName.filter(
      (item) => !valuesToDelete.includes(item.COLUMN_NAME),
    );

    for (const obj of filteredResult) {
      result.push(obj.COLUMN_NAME);
    }

    return res.json(responser(`All columns of ${table_name}`, result));
  }
  const allViewsName = await dbRequest(
    `SELECT table_name FROM information_schema.tables WHERE table_type = '${table_type}' AND table_schema = DATABASE()`,
  );
  if (!allViewsName) throwError(500);

  for (const obj of allViewsName) {
    result.push(obj.TABLE_NAME);
  }
  return res.json(responser('All Views list', result));
};

exports.getWhatsappExotelTemplate = async (req, res) => {
  const response = await getWhatsappExotelTemplateService(req.query);
  let respPayload = [];
  console.log('response', JSON.stringify(response, null, 2));

  if (
    !req.query.template_name &&
    response.data?.response?.whatsapp?.templates
  ) {
    respPayload = response.data.response.whatsapp.templates.map((template) => ({
      name: template.data.name,
      status: template.data.status,
      reason: template.data.rejected_reason || '',
      body:
        template.data.components?.find((comp) => comp.type === 'BODY')?.text ||
        '',
      template_id: template.data.id,
    }));
  } else {
    respPayload = [response.data.response.whatsapp.templates[0].data];
  }

  return res.json(responser('Templates', respPayload));
};

exports.createWhatsappTemplate = async (req, res) => {
  const response = await createWhatsappExotelTemplateService(req.body);
  return res.json(
    responser('WhatsApp template created successfully', response.data),
  );
};
