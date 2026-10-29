const { throwError } = require('../../../utils/helperFunction');
const {
  getRecords,
  columnMappingService,
  dbRequest,
  filterFunctionality,
} = require('../../../utils/dbFunctions');

function convertColumnToLabel(columnName) {
  let rgx = new RegExp('_', 'g');
  columnName = columnName.replace(rgx, ' ').replace(' id', '');
  columnName = columnName
    .split(' ')
    .map((ele) => ele.charAt(0).toUpperCase() + ele.slice(1))
    .join(' ');
  return columnName;
}
// Function to extract variables within ${} from the query
const extractVariables = (sql) => {
  const regex = /\$\{(.*?)\}/g; // Regex to match anything inside ${}
  let match;
  const variables = [];

  while ((match = regex.exec(sql)) !== null) {
    variables.push(match[1].trim()); // Push variable name inside ${}
  }

  return variables;
};
const checkVariables = (vars, dataObj) => {
  const missingVariables = [];

  vars.forEach((variable) => {
    const keys = variable.split('.').slice(1); // remove 'data' and use the rest
    let value = dataObj;

    // Traverse the keys in the object
    for (let key of keys) {
      if (value && key in value) {
        value = value[key];
      } else {
        missingVariables.push(variable);
        break;
      }
    }
  });

  return missingVariables;
};

async function handleShowChangeList(payload) {
  let oldValues = {};
  let newValues = {};
  Object.keys(payload).forEach((ele) => {
    oldValues[ele] = payload[ele].old_value;
    newValues[ele] = payload[ele].new_value;
  });
  await columnMappingService(oldValues);
  await columnMappingService(newValues);
  let rowRecord = [];
  Object.keys(oldValues).forEach((ele) => {
    rowRecord.push(
      `<tr><td>${convertColumnToLabel(ele)}</td><td>${oldValues[ele]}</td><td>${newValues[ele]}</td></tr>`,
    );
  });
  return `<table><thead><tr><th>Field</th><th>Old</th><th>New</th></tr></thead><tbody>${rowRecord.join('')}</tbody></table>`;
}

exports.renderTemplateService = async (template_code, payload = {}) => {
  let data = JSON.parse(JSON.stringify(payload));
  // console.log(template_code,"This is template code ");

  console.log('data in renderTemplateService==>', data);
  let template = (
    await getRecords(
      'latest_templates',
      filterFunctionality({ template_code: template_code }),
      // `where template_code="${template_code}" AND status="ACTIVE"`
    )
  )[0];
  // console.log(template,"This is wtegt");

  if (!template) throwError(400, 'Invalid template');
  let body = template.body;
  // console.log(body,"This is template body");

  let subject = template.template_subject;
  if (template.call_type === 'SQL_VIEW') {
    let viewSql = (
      await getRecords(
        'latest_templates_dynamic_views',
        `where templates_dynamic_views_code="${template.table_name_or_dynamic_view_code}"`,
      )
    )[0];

    if (!viewSql) throwError(400, 'No view found!');
    let varibleCheck = extractVariables(viewSql.view_sql);
    let missingVariables = checkVariables(varibleCheck, data);
    if (missingVariables.length) {
      throwError(400, 'Missing variables: ' + missingVariables.join(', '));
    }
    let resultData =
      (await dbRequest(eval('`' + viewSql.view_sql + '`'))).result || {};
    data = { ...data, ...resultData };
  } else if (template.call_type === 'TABLE') {
    for (let ele of Object.keys(data)) {
      if (ele !== 'track_changes') await columnMappingService(data[ele]);
    }
  }
  let templateVariable = body.match(/@@[a-zA-Z._]*/g) || [];
  let subjectVariable = subject.match(/@@[a-zA-Z._]*/g) || [];
  templateVariable = [...templateVariable, ...subjectVariable];
  templateVariable = templateVariable.map((ele) => ele.replace('@@', ''));
  templateVariable = templateVariable.map((v, i) =>
    v.endsWith('.') ? v.slice(0, -1) : v,
  );
  // console.log(template)
  for (let column of templateVariable) {
    let regx = new RegExp(`@@${column}`, 'g');
    // console.log(regx)
    if (
      column === 'track_changes' &&
      data['track_changes'] &&
      Object.keys(data['track_changes']).length
    ) {
      body = body.replace(regx, await handleShowChangeList(data[column]));
    } else {
      // console.log("column:",column,"\nbody:",body,"\nregx:",regx);
      if (body) body = body.replace(regx, eval(`data.${column}`));
    }
    if (subject) subject = subject.replace(regx, eval(`data.${column}`));
  }
  return { body, subject };
};

/**
 * @function getEmailBodyByTemplateMapping
 * @description Get the email body according to the template mapping with module and sub module.
 * @param {string} moduleName - The module name to find the template mapping.
 * @param {string} subModuleName - The sub module name to find the template mapping.
 * @param {Object} payload - The payload object to be used in the template body.
 * @returns {Promise<{subject:string,body:string}>} The email body.
 */
exports.getEmailBodyByTemplateMapping = async (
  moduleName,
  subModuleName,
  payload = {},
) => {
  let templateCode = (
    await getRecords(
      'latest_template_module_mapping',
      `where module="${moduleName}" and sub_module="${subModuleName}"`,
      null,
      ['template_code'],
    )
  )[0];
  console.log(templateCode, 'temp');

  if (!templateCode)
    throwError(404, 'Invalid module or submodule for template mapping.');
  return await this.renderTemplateService(templateCode.template_code, payload);
};
