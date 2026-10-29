const dbConfig = require('../config/database.config');
const Sequelize = require('sequelize');
const mysql = require('mysql2');
const {
  throwError,
  getData,
  deleteKeyValuePair,
  setDateTimeFormat,
  removeNullValueKey,
  decipherDecryption,
} = require('./helperFunction');
const { json } = require('body-parser');
const { object } = require('joi');

/**
 * Initiate instance of Squilize with database
 * @returns {Sequelize} instance of Squilize.
 */
exports.squilizeInit = () => {
  // create the connection to database
  if (process.env.NODE_ENV === 'production') {
    return new Sequelize(
      dbConfig.production.database,
      dbConfig.production.username,
      dbConfig.production.password,
      {
        //  dialect: "mysql",
        dialect: dbConfig.production.dialect,
        host: dbConfig.production.host,
        logging: false,
        freezeTableName: true,
        dialectOptions: {
          multipleStatements: true,
        },
      },
    );
  }
  return new Sequelize(
    dbConfig.development.database,
    dbConfig.development.username,
    dbConfig.development.password,
    {
      //  dialect: "mysql",
      dialect: dbConfig.development.dialect,
      host: dbConfig.development.host,
      logging: false,
      freezeTableName: true,
      dialectOptions: {
        multipleStatements: true,
      },
    },
  );
};

/**
 * Initiate instance of mysql2 with database.
 * @returns {mysql} Instance of mysql2
 */
const dbMysql = () => {
  // create the connection to database
  if (process.env.NODE_ENV === 'production') {
    return mysql.createConnection({
      host: dbConfig.production.host,
      user: dbConfig.production.username,
      password: dbConfig.production.password,
      database: dbConfig.production.database,
      multipleStatements: false,
    });
  } else {
    return mysql.createConnection({
      host: dbConfig.development.host,
      user: dbConfig.development.username,
      password: dbConfig.development.password,
      database: dbConfig.development.database,
      multipleStatements: false,
    });
  }
};

/**
 * Help to query on database.
 * @param {string} query
 * @param {array} any
 * @returns {Promise<[]>} result contains array of object data and errMsg will contain any error message.
 */
exports.dbRequest = async (query, any = []) => {
  let start = performance.now();
  let con = dbMysql();
  console.log('\n\n Query: ', mysql.format(query, any));
  con.connect();
  let [result] = any.length
    ? await con
        .promise()
        .query(query, [any])
        .catch((err) => {
          console.log('DB error h:', err);
          throwError(404, err.sqlMessage);
        })
    : await con
        .promise()
        .query(query)
        .catch((err) => {
          console.log('DB error dk:', err);
          throwError(404, err.sqlMessage);
        });
  con.destroy();
  let end = performance.now();
  console.log(`DB processing time: ${(end - start) / 1000} seconds\n\n`);
  return result;
};

/**
 * Get columns name from table
 * @param {string} tableName Name of the table.
 * @param {Array<number>} columnIndex Index number of column with base 0.
 * @param {{
 * isInsertTs:boolean,
 * isPrmiaryId:boolean,
 * columnsInArray:boolean
 * includeUniqueId:boolean
 * alias:string
 * }} options other options.
 * @returns {Promise<string>} Returns columns name in array of string.
 */
exports.getTableColumnsNames = async (
  tableName,
  columnName = [],
  options = {
    isInsertTs: false,
    isPrmiaryId: false,
    columnsInArray: false,
    includeUniqueId: true,
    alias: '',
    replaceColumnName: [],
  },
) => {
  let result = [];
  if (columnName && columnName.length) {
    if (Array.isArray(columnName))
      result = columnName.map((ele) => '`' + ele + '`');
    else result = columnName.split(',').map((ele) => '`' + ele + '`');
  } else {
    result = await this.dbRequest(`DESCRIBE \`${tableName}\`;`);
    result = result?.map((ele) => '`' + ele.Field + '`');
  }
  if (
    !tableName.startsWith('latest_') &&
    !options.isInsertTs &&
    result.at(-1) === '`insert_ts`'
  )
    result?.pop();
  // Options handling
  if (
    !options.isPrmiaryId &&
    result[0] === '`' + `${tableName.replace('latest_', '')}_id` + '`' &&
    !columnName?.includes(`${tableName}_id`)
  )
    result?.shift();
  if (options.includeUniqueId === false) {
    result = result.filter((ele) => !ele.includes('_unique_id'));
  }
  if (options?.alias)
    result = result.map((ele) => `\`${options.alias}\`.${ele}`);
  if (options.replaceColumnName?.length) {
    let columnMerge = result.join('<-|->,');
    for (let ele of options.replaceColumnName) {
      columnMerge = columnMerge.replace(
        (options.alias ? '`' + options.alias + '`.' : '') +
          '`' +
          ele.from +
          '`',
        ele.to,
      );
    }
    result = columnMerge.split('<-|->,');
  }
  if (options.columnsInArray) return result;
  return result?.toString();
};

/**
 * Returns total count number of records.
 * @param {string} table Table name.
 * @return {Promise<{number}>}.
 */
exports.getCountRecord = async (table, filter, removeAlias = null) => {
  fltr = filter?.replace(
    removeAlias ? new RegExp(removeAlias + '.', 'g') : '',
    '',
  );
  return (
    await this.dbRequest(
      `select count(1) as totalRecords from ${table} ${fltr};`,
    )
  )[0].totalRecords;
};

/**
 * Fetch Records from given table or view.
 * @param {string} name Name of table or view.
 * @param {string|null} filter Filter SQL.
 * @param {string|null} pagination Pagination SQL.
 * @param {Array<string>|null} columnName Name of column to getselected columns records.
 * @param {{isInsertTs:boolean,isPrmiaryId:boolean,"isDistinct":boolean,includeUniqueId:boolean}} options other options.
 * @return {Promise<[]>} Return array of object in promise.
 */
exports.getRecords = async (
  name,
  filter,
  pagination,
  columnName = [],
  options,
) => {
  let columns = await this.getTableColumnsNames(name, columnName, options);
  let sql = `select ${
    options?.isDistinct ? 'DISTINCT' : ''
  } ${columns} from ${name} ${filter || ''} ${
    options?.isDistinct ? '' : pagination || ''
  };`;
  console.log('Get SQL=', sql);
  return await this.dbRequest(sql);
};

exports.getFieldAndType = async (name) => {
  let obj = {};
  (await this.dbRequest(`DESCRIBE \`${name}\`;`)).forEach((ele) => {
    obj[ele.Field] = ele.Type;
  });
  return obj;
};

/**
 * Help to set params from request.
 * @param {Object} requestObject request object.
 * @param {string} tableName Table name.
 * @param {Array<number>} columnIndex Index number of column with base 0.
 * @param {{isInsertTs:boolean,isPrmiaryId}} options other options.
 * @returns {Promise<Array>} setted request data in form of Array of string.
 */
exports.parseRequestParams = async (
  requestObject,
  tableName,
  columnIndex = [],
  options = { isInsertTs: false, isPrmiaryId: false },
  columns = null,
  columnTypes = null,
) => {
  if (!columns) {
    columns = `${(
      await this.getTableColumnsNames(tableName, columnIndex, options)
    ).toString()}`;
  }
  if (!columnTypes) {
    columnTypes = await this.getFieldAndType(tableName);
  }
  if (Array.isArray(requestObject)) {
    for (let index = 0; index < requestObject.length; index++) {
      requestObject[index] = await this.parseRequestParams(
        requestObject[index],
        tableName,
        columnIndex,
        options,
        columns,
        columnTypes,
      );
    }
    return requestObject;
  } else {
    let arrayData = columns.split(',').map((column) => {
      column = column.replace(/`/g, '');
      if (column === 'status' && !requestObject[column])
        requestObject[column] = 'ACTIVE';
      if (
        // (Array.isArray(requestObject[column]) ||
        //   typeof requestObject[column] === 'object') &&
        columnTypes[column] === 'json' &&
        requestObject[column] !== null
      ) {
        requestObject[column] = JSON.stringify(requestObject[column], null, 2);
      }
      if (
        ['datetime', 'timestamp', 'date'].includes(columnTypes[column]) &&
        requestObject[column] !== null &&
        requestObject[column] !== undefined
      ) {
        requestObject[column] = setDateTimeFormat(
          columnTypes[column],
          requestObject[column],
        );
      }
      return requestObject[column] === null ? null : requestObject[column];
    });
    // console.log('requestObject=', requestObject);
    return arrayData;
  }
};

/**
 * Insert Records from given table or view.
 * @param {string} name Name of table or view.
 * @param {{string:any} | [{string:any}]} data Object key-value pair or array of object.
 * @param {Array<number>} columnIndex Index number of column with base 0.
 * @param {{isInsertTs:boolean,isPrmiaryId}} options other options.
 * @return {Promise<void>} void.
 */
exports.insertRecords = async (name, data, columnIndex, options) => {
  let formValue = await this.parseRequestParams(
    Array.isArray(data) ? [...data] : JSON.parse(JSON.stringify(data)),
    name,
    columnIndex,
    options,
  );
  // console.log('before formValue', formValue);
  let columns = await this.getTableColumnsNames(name, null, {
    ...options,
    columnsInArray: true,
  });
  // console.log('columns', columns);
  let uniqueIdIndex = columns.indexOf(`\`${name}_unique_id\``);
  // console.log('unqueIdIndex', uniqueIdIndex);
  if (!formValue.every((ele) => ele && ele.constructor === Array))
    formValue = [formValue];
  let maxUniqueId =
    (
      await this.dbRequest(
        `select max(${name}_unique_id) as maxUniqueId FROM \`${name}\``,
      )
    )[0].maxUniqueId || 0;
  for (let i in formValue) {
    if (!formValue[i][0]) formValue[i].splice(uniqueIdIndex, 1, ++maxUniqueId);
  }
  // console.log('After formValue', formValue);
  return await this.dbRequest(
    `INSERT INTO \`${name}\` (${columns.toString()}) VALUES ?`,
    formValue,
  );
};

/**
 * Check whether record is exist or not, only work for unique record, for duplicate record existance use getCountRecord.
 * @param {string} name Name of the table.
 * @param {Array<string>} columnName Name of the column in which you are tring to search record.
 * @param {Array<string>} value Value which is need to be search.
 * @returns {Promise<0|1>}
 */
exports.isRecordExist = async (name, columnName, value) => {
  let promiseResp = columnName.map((cl, index) =>
    this.dbRequest(
      `SELECT IF(COUNT(${cl}),COUNT(${cl}),0) AS isExist FROM ${name} WHERE ${cl}='${value[index]}'`,
    ),
  );
  let resultant = await Promise.all(promiseResp);
  // resultant = resultant.map((obj) => obj.result);
  return resultant.some((ele) => ele[0].isExist === 1);
};

/**
 * Insert Records from given table or view.
 * @param {string} table Name of table or view.
 * @param {string} incrementalColumnName Name of the incremental column.
 * @param {string} linkageColumnName Name of the linked column.
 * @param {{string:any}| [{string:any}] } data Data object.
 * @param {{isInsertTs:boolean,isPrmiaryId:boolean,startFromZero:boolean}} options other options.
 * @return {Promise<void>} void.
 */
exports.insertRecordHandleIncremental = async (
  table,
  incrementalColumnName,
  linkageColumnName,
  data,
  options,
) => {
  if (
    data[incrementalColumnName] === 0 ||
    data[incrementalColumnName] === null ||
    data[incrementalColumnName] === undefined
  ) {
    let maxValue =
      (
        await this.dbRequest(
          `select max(${incrementalColumnName}) as maximmumValue FROM ${table} where ${linkageColumnName}='${data[linkageColumnName]}'`,
        )
      )[0].maximmumValue || 0;
    if (options?.startFromZero)
      data[incrementalColumnName] = parseInt(maxValue);
    else data[incrementalColumnName] = parseInt(maxValue) + 1;
  } else {
    let isValid = (
      await this.dbRequest(
        `select count(${incrementalColumnName}) as isValid from ${table} where  ${linkageColumnName}='${data[linkageColumnName]}' and ${incrementalColumnName}='${data[incrementalColumnName]}'`,
      )
    )[0].isValid;
    if (!isValid) {
      let maxValue =
        (
          await this.dbRequest(
            `select max(${incrementalColumnName}) as maximmumValue FROM ${table} where ${linkageColumnName}='${data[linkageColumnName]}'`,
          )
        )[0].maximmumValue || 0;
      data[incrementalColumnName] = parseInt(maxValue) + 1;
    }
  }
  return await this.insertRecords(table, data, null, options);
};

exports.likeFilterSqlQuery = (columns = [], value = '') => {
  let likeSql = '';
  columns = columns[0]
    .split(',')
    .map((ele) => ele.match(/[A-Za-z_]/g).join(''));
  if (!!value && columns.length) {
    likeSql = '`' + columns.join('`,`') + '`';
    likeSql = likeSql.replace(/,/g, ` like ? OR `) + ` like ?`;
  }
  return (
    '(' +
    mysql.format(
      likeSql,
      columns.map((_) => `%${value.trim()}%`),
    ) +
    ')'
  );
};

exports.filterFunctionality = (
  idSearch,
  status,
  to_date,
  from_date,
  columns = [],
  value = '',
  options = {
    alias: '',
    dateFilterColumn: null,
  },
) => {
  const aliases = options.alias ? options.alias + '.' : '';
  if (
    columns.length > 0 &&
    columns[0] &&
    (columns[0].trim().startsWith(',') ||
      columns[0].trim().endsWith(',') ||
      columns[0].trim().includes(',,') ||
      columns[0].trim().includes('null'))
  ) {
    throwError(404, 'Element in the columns cannot be empty or null.');
  }

  if (columns.length > 0 && columns[0] == '') {
    throwError(404, 'Element in the columns cannot be empty .');
  }

  if (value !== '' && columns[0] === undefined) {
    console.log('valueis empty ', value);
    throwError(404, 'Both columns and value are required for search.');
  }

  if (value == '' && columns[0] !== '' && columns[0] !== undefined) {
    console.log('valueis empty ', value);
    throwError(404, 'Both columns and value are required for search.');
  }

  let obj = { idSearch, to_date, from_date };
  if (from_date) from_date += ' 00:00:00';
  if (to_date) to_date += ' 23:59:59';
  obj[`${aliases}status`] = status;

  // Deleting null key-value
  Object.keys(obj).forEach((key, index) => {
    if (key === 'idSearch') {
      Object.keys(idSearch || {}).forEach((key) => {
        if (!idSearch[key] && idSearch[key] !== 0) delete idSearch[key];
      });
    }
    if (
      !obj[key] ||
      (typeof obj[key] === 'object' && !Object.keys(obj[key]).length)
    ) {
      delete obj[key];
    }
  });
  let keyObj = Object.keys(obj);
  let subSql = '';
  // If any variable has data
  if (Object.keys(obj).length || (!!value && columns.length)) subSql = 'WHERE ';

  keyObj.forEach((key, index) => {
    if (obj[key]) {
      if (typeof obj[key] === 'object') {
        let keyIdSearch = Object.keys(obj[key]);
        keyIdSearch.forEach((idKey, i) => {
          subSql += aliases + '`' + idKey + '`' + '=' + ` ? `;
          if (keyIdSearch.length - 1 !== i) subSql += ' AND ';
        });
        if (keyObj.length - 1 !== index) subSql += ' AND ';
      } else {
        subSql += key + '=' + ` ? `;
        if (keyObj.length - 1 !== index) subSql += ' AND ';
      }
    }
  });
  subSql = subSql.replace(
    'from_date=',
    `${aliases}${options.dateFilterColumn || 'insert_ts'}>=`,
  );
  subSql = subSql.replace(
    'to_date=',
    `${aliases}${options.dateFilterColumn || 'insert_ts'}<=`,
  );
  // Apply like filter

  if (!!value && columns.length) {
    if (subSql.length && subSql !== 'WHERE ') subSql += ' AND ';
    subSql += ' ' + this.likeFilterSqlQuery(columns, value);
  }
  let valuesArr = Object.values(idSearch || {});
  valuesArr = [...valuesArr, to_date, from_date, status];
  valuesArr = valuesArr.filter((ele) => ele);
  console.log(subSql, valuesArr);
  subSql = mysql.format(subSql, valuesArr);
  return subSql;
};

/**
 * @typedef { "EQUAL" | "NOT_EQUAL" | "GREATER"  | "LESSER" | "GREATER_THAN_EQUAL" | "LESSER_THAN_EQUAL" | "CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "DATE_RANGE" } Operators
 */
/**
 * @typedef {{
 * column: Array<string>,
 * operator: Operators,
 * value: string
 * }} SqlFilter
 */
/**
 *
 * @param {SqlFilter} payload
 */
exports.createConditionExpression = (payload) => {
  let tempSql = '';
  payload.column = payload.column.map((column) =>
    column.match(/[A-Za-z_.]/g).join(''),
  );
  console.log(payload, 'payload here');
  switch (payload.operator) {
    case 'EQUAL':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` = ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'NOT_EQUAL':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` <> ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'GREATER':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` > ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'LESSER':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` < ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'GREATER_THAN_EQUAL':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` >= ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'LESSER_THAN_EQUAL':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` <= ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => payload.value);
      break;
    case 'CONTAINS':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` LIKE ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => `%${payload.value}%`);
      break;
    case 'ENDS_WITH':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` LIKE ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => `${payload.value}%`);
      break;
    case 'STARTS_WITH':
      tempSql = `(${payload.column.map((column) => `\`${column.split('.').join('`.`')}\` LIKE ?`).join(' OR ')})`;
      payload.value = payload.column.map((e) => `%${payload.value}`);
      break;
    case 'DATE_RANGE':
      if (payload.value.includes(',')) {
        payload.value = payload.value.split(',');
        console.log(payload.value);
        if (payload.value[0]) {
          payload.value[0] += ' 00:00:00';
          tempSql = `${payload.column.split('.').join('`.`')} >= ?`;
        }
        if (payload.value[1]) {
          payload.value[1] += ' 23:59:59';
          if (!tempSql) payload.value.shift();
          tempSql += tempSql
            ? ` AND ${payload.column.split('.').join('`.`')} <= ?`
            : `${payload.column.split('.').join('`.`')} <= ?`;
        }
      } else {
        payload.value += ' 00:00:00';
        tempSql = `${payload.column.split('.').join('`.`')} >= ?`;
      }
      break;
  }
  return mysql.format(tempSql, payload.value);
};

/**
 *
 * @param {Array<{
 * column: Array<string>,
 * operator: Operators,
 * value: string,
 * logicalOperator: "AND" | "OR"
 * }>| SqlFilter} filterPayload
 * @param {{string:string[]}} alias key will be alias and values will be array of columns or ['*] for all
 */
exports.advanceFiltering = (filter, filterPayload, alias) => {
  if (typeof filterPayload === 'string') {
    try {
      filterPayload = JSON.parse(filterPayload);
    } catch (_) {
      this.throwError(400, 'Invalid filter payload');
    }
    if (!Array.isArray(filterPayload)) {
      filterPayload = [filterPayload];
    }
  }
  if (alias) {
    let matchedColumn = [];
    for (let al in alias) {
      if (alias[al].includes('*')) {
        filterPayload.forEach((obj, i) => {
          obj.column.forEach((col, j) => {
            if (matchedColumn.indexOf(col) == -1) {
              matchedColumn.push(col);
              filterPayload[i].column[j] = `${al}.${col}`;
            }
          });
        });
      } else {
        alias[al].forEach((ele) => {
          filterPayload.forEach((obj, i) => {
            obj.column.forEach((col, j) => {
              col = col.split('.').at(-1);
              if (ele === col) {
                // if (matchedColumn.indexOf(ele) == -1) {
                matchedColumn.push(ele);
                filterPayload[i].column[j] = `${al}.${col}`;
                // }
              }
            });
          });
        });
      }
    }
  }
  let conditionArr = filterPayload.map((payload, index) => {
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (_) {
        this.throwError(400, 'Invalid filter payload');
      }
    }
    return `${index ? payload.logicalOperator || 'AND' : ''} ${this.createConditionExpression(
      payload,
    )}`;
  });
  console.log(conditionArr, 'conditionArr');
  conditionArr = conditionArr.join(' ').trim();
  if (conditionArr) {
    filter += (filter ? ' AND ' : 'WHERE ') + conditionArr;
  }
  return filter;
};

/**
 * Return SQL of pagination and in decreasing order.
 * @param {number} pageNo Page number.
 * @param {number} itemPerPage Item per page.
 * @returns {string} String of SQL.
 */
exports.pagination = (
  pageNo,
  itemPerPage,
  pageLimit,
  options = { preventOrderBy: false },
) => {
  // return `ORDER BY insert_ts DESC ${
  if (pageLimit) {
    return pageNo && itemPerPage
      ? `${!options.preventOrderBy ? 'ORDER BY 1 DESC' : ''} limit ${pageLimit} OFFSET ${(pageNo - 1) * itemPerPage}`
      : `${!options.preventOrderBy ? 'ORDER BY 1 DESC' : ''} limit 0, 100`;
  }
  return `${
    pageNo && itemPerPage
      ? `${!options.preventOrderBy ? 'ORDER BY 1 DESC' : ''} limit ${(pageNo - 1) * itemPerPage},${itemPerPage}`
      : `${!options.preventOrderBy ? 'ORDER BY 1 DESC' : ''} limit 0,100`
  }`;
};

exports.dataStringForSQL = (formValue = []) => {
  formValue = formValue.map((item) => item || 'null');
  let modifiedString = formValue.map((item) => "'" + item + "'").toString();
  if (modifiedString.includes('{') && modifiedString.includes('}')) {
    let start = modifiedString.indexOf('{');
    let end = modifiedString.indexOf('}');
    let newString = '';
    for (let i = start; i <= end; i++) {
      if (modifiedString[i] !== "'") newString += modifiedString[i];
    }
    modifiedString = modifiedString.replace(
      modifiedString.slice(start, end + 1),
      newString,
    );
  }
  return modifiedString.replace(/'null'/g, 'NULL');
};

exports.otpHandler = async (user_uuid, otp_for, otp) => {
  return (
    await this.dbRequest(
      `call otp_handler('${user_uuid}',${
        otp ? `'${otp}'` : 'NULL'
      },'${otp_for}')`,
    )
  )[0][0].value;
};

/**
 * Update record in table
 * @param {string} table Table name
 * @param {{}} data Key value pair.
 * @param {{}} condition Key value pair
 * @returns {Promise<void>}
 */
exports.updateRecord = async (table, data, condition) => {
  let setPayload = Object.keys(data)
    .map((key) => `${key}='${data[key]}'`)
    .join(', ');
  let wherePayload = Object.keys(condition)
    .map((key) => `${key}='${condition[key]}'`)
    .join(' AND ');
  let sql = `UPDATE ${table} SET ${setPayload} WHERE ${wherePayload}`;
  await this.dbRequest(sql);
};

/**
 * Check if the record is valid
 * @param {string} table Table name
 * @param {{}} condition Key value pair
 * @returns {Promise<boolean>}
 */
exports.isValidRecord = async (table, condition) => {
  let wherePayload = Object.keys(condition)
    .map((key) => `${key}='${condition[key]}'`)
    .join(' AND ');
  let sql = `SELECT COUNT(1) as isValid FROM ${table} WHERE ${wherePayload}`;
  return (await this.dbRequest(sql))[0].isValid;
};

exports.roleFilterService = async (
  filterSql,
  tableName,
  selfUser,
  options = { alias: '' },
) => {
  if (!process.env.ROLE_FILTER || process.env.ROLE_FILTER === 'false')
    return filterSql;
  let roleFiletrData = (
    await this.dbRequest(
      `call role_content_access('${selfUser.role_uuid}',"${tableName}")`,
    )
  )[0];
  if (!roleFiletrData.length)
    throwError(403, 'No module access for this Role!');
  if (
    !roleFiletrData[0].view_access ||
    roleFiletrData[0].status !== 'ACTIVE' ||
    (roleFiletrData[0].module_name !== 'Approval' &&
      !Object.keys(roleFiletrData[0].filter_values).length)
  )
    throwError(403, 'You have no access to see this module content!');
  let initJsonValue = roleFiletrData[0].filter_values;
  let andOr = initJsonValue.hasOwnProperty('and')
    ? 'and'
    : initJsonValue.hasOwnProperty('or')
      ? 'or'
      : '';
  let jsonValue = andOr ? initJsonValue[andOr] : initJsonValue;
  if (jsonValue.hasOwnProperty('branch_uuid')) {
    let branchOfZone = selfUser['branch_uuid'];
    if (jsonValue['branch_uuid'].includes('self_zone')) {
      let dataOfZone = (
        await this.getRecords(
          'latest_zone',
          `WHERE JSON_CONTAINS(branches_uuid, '{"branch_uuid": "${branchOfZone}"}') > 0`,
        )
      )[0];
      dataOfZone.branches_uuid.forEach((branch) => {
        jsonValue.branch_uuid.push(branch.branch_uuid);
      });
      // Find the index of 'self_zone' in the branch_uuid array
      let indexToRemove = jsonValue.branch_uuid.indexOf('self_zone');

      // Remove 'self_zone'
      if (indexToRemove !== -1) {
        jsonValue.branch_uuid.splice(indexToRemove, 1);
      }
    }
    jsonValue.branch_uuid = [
      ...new Set([...jsonValue.branch_uuid, ...selfUser['branch_uuid']]),
    ];
  }

  let keys = Object.keys(jsonValue);

  let roleFiletrQuery = '';
  keys.forEach((key) => {
    let subQuery = '';
    if (
      Array.isArray(jsonValue[key]) &&
      !jsonValue[key].includes('*') &&
      jsonValue[key].length
    ) {
      subQuery =
        '(' +
        jsonValue[key]
          .map((ele) =>
            key === 'branch_uuid'
              ? `${key} in ("${selfUser[ele] || ele}")`
              : `${key}=
          "${selfUser[ele] || ele}"`,
          )
          .join(' or ') +
        ')';
    }
    if (roleFiletrQuery && subQuery) {
      roleFiletrQuery = roleFiletrQuery + ' ' + andOr + ' ' + subQuery;
    } else if (subQuery) roleFiletrQuery += subQuery;
  });
  if (roleFiletrQuery) {
    if (!Array.isArray(roleFiletrData[0].map_column_user_uuid))
      throwError(400, 'Invalid map_column_user_uuid as array!');
    let mapColumnIdQuery = roleFiletrData[0].map_column_user_uuid
      .map(
        (ele) =>
          `${
            options.alias + ele
          } IN ( select ${ele === 'branch_uuid' ? 'branch_uuid from latest_user_branch' : 'user_uuid from latest_user'} where ${roleFiletrQuery} )`,
      )
      .join(' OR ');
    filterSql = filterSql
      ? filterSql + ' AND ( ' + mapColumnIdQuery + ' )'
      : 'WHERE ' + mapColumnIdQuery;
  }
  console.log('\n\nrole Filter:', filterSql, '\n\n');
  return filterSql;
};

exports.isEditAccess = async (tableName, selfUser) => {
  if (!process.env.ROLE_FILTER || process.env.ROLE_FILTER === 'false')
    return true;
  let roleFiletrData = (
    await this.dbRequest(
      `call role_content_access('${selfUser.role_uuid}',"${tableName}")`,
    )
  )[0];
  if (!roleFiletrData.length)
    throwError(403, 'No module access for this Role!');
  if (
    !roleFiletrData[0].view_access ||
    !roleFiletrData[0].edit_access ||
    roleFiletrData[0].status !== 'ACTIVE'
  )
    throwError(403, 'You have no access to Edit this module!');
};

/**
 * Count occurrences of different types in a column
 * @param {string} table Table name
 * @param {string} column Column name
 * @returns {Promise<Array<{type: string, count: number}>>}
 */
exports.countTypesInColumn = async (table, column, filter) => {
  let sql = `
    SELECT ${column}, COUNT(*) AS count
    FROM ${table} ${filter}
    GROUP BY ${column};
  `;
  return await this.dbRequest(sql);
};

/**
 *
 * @param {string} tableName
 * @param {Array<{}>|{}} data
 * @param {string[]} whereColumn
 * @param {string[]} columnIndex
 * @param {{
 * isInsertTs:boolean,
 * isPrmiaryId:boolean,
 * columnsInArray:boolean
 * }} options
 * @returns {Promise<{result,sql}>}
 */

exports.upsertRecords = async (
  name,
  data,
  whereCondition,
  columnName,
  options,
) => {
  removeNullValueKey(data);
  let columns = await this.getTableColumnsNames(name, columnName, options);
  let valuesArr = [];
  columns = columns.split(',').map((ele) => {
    if (data[ele.replace(/`/g, '')]) {
      valuesArr.push(data[ele.replace(/`/g, '')]);
    }
    return data[ele.replace(/`/g, '')] ? ` ${ele}` : ele;
  });
  console.log(columns, 'columns');

  let sql = `INSERT INTO ${name} (${await this.getTableColumnsNames(
    name,
  )}) (select ${columns} from ${
    options?.otherViewName || `latest_${name}`
  } ${whereCondition} )`;
  console.log(sql, 'sql');
  console.log(valuesArr, 'valuesArr');

  return await this.dbRequest(sql, valuesArr);
};

exports.listOrderBy = (filter, value, desc = true) => {
  return (
    filter + ` order by ${value ? value : 'insert_ts'} ${desc ? 'DESC' : 'ASC'}`
  );
};

exports.isTableOrViewExist = async (name) => {
  let result = await this.dbRequest(`SHOW TABLES LIKE '${name}'`);
  return result.length ? true : false;
};

/**
 * Insert on updated Audit columns.
 * @param {string} name Table name
 * @param {object} data Request body
 * @param {array} columns Columns name of the given table or view.
 * @return {timestamp} Return timestamp in create ts.
 */
exports.handleAuditColumns = async (tableName, data, columns) => {
  let whereCondition = 'WHERE ';
  whereCondition += columns
    .map((ele) => `${ele} = '${data[ele]}'`)
    .join(` AND `);

  const checkRecord = await this.getRecords(tableName, whereCondition);
  if (checkRecord.length) {
    data.create_ts = setDateTimeFormat('timestamp', checkRecord[0].create_ts);
    data.created_by_uuid = checkRecord[0].created_by_uuid;
    data.created_by_name = checkRecord[0].created_by_name;
    return;
  }
  return (data.create_ts = setDateTimeFormat('timestamp'));
};

/**
 * Find invalid given references which doesn't exist in table or inactive.
 * @param {string} tableName
 * @param {string} referenceColumn
 * @param {Array<string|number>} values
 * @returns
 */
exports.getInvalidReferences = async (tableName, referenceColumn, values) => {
  let subSql = values.map((id, i) => {
    if (i === 0) {
      return `SELECT ${id} AS \`${referenceColumn}\``;
    }
    return `SELECT ${id}`;
  });
  subSql = subSql.join(' UNION ALL ');
  let sql = `WITH requested_ids AS (${subSql}) SELECT ft.\`${referenceColumn}\` FROM requested_ids ft LEFT JOIN \`${tableName}\` rt ON ft.\`${referenceColumn}\` =rt.\`${referenceColumn}\` WHERE rt.\`${referenceColumn}\` IS NULL OR rt.\`status\`="INACTIVE";`;
  return (await dbRequest(sql)).result;
};

/**
 * Get the system user's access token.
 * @returns {Promise<{}>} The access token of the system user.
 */
exports.getSystemUserToken = async () => {
  let systemUserFactId = (
    await this.getRecords(
      'latest_user',
      `where email="${process.env.SUPERADMIN_EMAIL}"`,
      null,
      ['user_uuid'],
    )
  )[0];
  if (!systemUserFactId) throwError(400, 'No system user found.');
  let token = (
    await this.getRecords(
      'user_session',
      `where user_uuid="${systemUserFactId.user_uuid}"`,
    )
  )[0];
  if (!token) throwError(400, 'No token found.');
  return token.access_token;
};

/**
 * Generate condition for node or sql
 * @param {Array<{}>} condition
 * @param {"NODE"|"SQL"} generateFor
 * @returns {string} condition string
 */
exports.generateConditionString = (condition, generateFor) => {
  if (!generateFor) this.throwError(400, 'generate for is require');
  let operators;

  switch (generateFor) {
    case 'NODE':
      operators = {
        EQUAL: '===',
        NOT_EQUAL: '!==',
        GREATER: '>',
        LESSER: '<',
        GREATER_THAN_EQUAL: '>=',
        LESSER_THAN_EQUAL: '<=',
        OR: '||',
        AND: '&&',
      };
      break;
    case 'SQL':
      operators = {
        EQUAL: '=',
        NOT_EQUAL: '<>',
        GREATER: '>',
        LESSER: '<',
        GREATER_THAN_EQUAL: '>=',
        LESSER_THAN_EQUAL: '<=',
        OR: 'OR',
        AND: 'AND',
      };
      break;
  }
  let subCondition = [];
  condition.forEach((ele) => {
    if (ele.hasOwnProperty('and')) {
      subCondition.push(
        '(' +
          this.generateConditionString(ele['and'], generateFor).join(
            ` ${operators['AND']} `,
          ) +
          ')',
      );
    } else if (ele.hasOwnProperty('or')) {
      subCondition.push(
        '(' +
          this.generateConditionString(ele['or'], generateFor).join(
            ` ${operators['OR']}  `,
          ) +
          ')',
      );
    } else {
      if (generateFor === 'SQL') {
        subCondition.push(
          `(${ele.column} ${operators[ele.operant]} ${ele.isColumnComparison ? `${ele.columnOrValue}` : `"${ele.columnOrValue}"`})`,
        );
      } else {
        subCondition.push(
          `("@@${ele.column}" ${operators[ele.operant]} "${ele.isColumnComparison ? `@@${ele.columnOrValue}` : ele.columnOrValue.toUpperCase()}")`,
        );
      }
    }
  });
  return subCondition;
};

/**
 * Generate dynamic SQL for multiple table join and filter
 * @param {Array<string>} views array of table name
 * @param {Object} onConditions object of join condition
 * @param {Array<Object>} whereConditions array of filter condition
 * @returns {string} dynamic SQL
 */
exports.generateDynamicSQLService = async (
  views,
  onConditions,
  whereConditions,
) => {
  let renderColumns = [];
  let joinTableQuery = [];
  let columns = views.map((view) =>
    this.getTableColumnsNames(view, null, { columnsInArray: true }),
  );
  columns = await Promise.all(columns);
  let firstView = views.shift();
  let firstViewColumns = columns.shift();
  renderColumns.push(
    `JSON_OBJECT(${firstViewColumns.map((clm) => `'${clm}', ${firstView}.${clm}`).join(', ')}) as ${firstView}`,
  );
  if (views.length) {
    views.forEach((view, i) => {
      let condition = this.generateConditionString(onConditions[view], 'SQL');
      joinTableQuery.push(`INNER JOIN ${view} ON ${condition}`);
      columns[i] = columns[i]
        .map((clm) => `'${clm}', ${view}.${clm}`)
        .join(', ');
      renderColumns.push(`JSON_OBJECT(${columns[i]}) as ${view}`);
    });
  }
  if (whereConditions.length > 1) {
    whereConditions = [{ or: [...whereConditions] }];
  }
  let whereCondition = this.generateConditionString(whereConditions, 'SQL');
  let sql = `select ${renderColumns.join(', ')} from ${firstView} ${joinTableQuery.join(' ')} ${whereConditions ? `where ${whereCondition}` : ''}`;
  return sql;
};

/**
 * Fetch records from latest_environment_configuration table for given keys.
 * @param {string[]} KEYS list of keys to fetch records for.
 * @returns {Promise<{}>} records found for given keys.
 *
 * Note: If the record is encrypted (i.e. is_encrypted is true), the value will be decrypted.
 */
exports.environmentConfigurationService = async (KEYS) => {
  if (!KEYS.length) return [];
  let results = await this.getRecords(
    'latest_environment_configuration',
    `where env_key IN ('${KEYS.join("','")}')`,
  );
  let resp = {};
  for (let ele of results) {
    if (ele.is_encrypted) resp[ele.env_key] = decipherDecryption(ele.env_value);
    else {
      resp[ele.env_key] = ele.env_value;
    }
  }
  return resp;
};

/**
 * Config Column Mapping
 * @param {{}} data
 * @param {{viewName:columnName}} specificColumns if not provided then choose reference column.
 */
exports.columnMappingService = async (data, specificColumns = {}) => {
  console.log('incoming data==>', data);
  let column = Object.keys(data);
  let columnMappingConfig = await this.getRecords('config_column_mapping');
  console.log('columnMappingConfig==>', columnMappingConfig);
  let filterColumns = [];
  column.forEach((ele) => {
    let obj = columnMappingConfig.find((cmc) => cmc.column_name === ele);
    if (obj) filterColumns.push(obj);
  });
  console.log('filterColumns==>', filterColumns);
  let mapColumn = filterColumns.map((ele) =>
    this.getRecords(
      ele.reference_view,
      `where ${ele.reference_common_column}=${data[ele.column_name]}`,
      null,
      [
        specificColumns[ele.reference_view] || ele.reference_column,
        `"${ele.column_name}" as column_name`,
      ],
    ),
  );
  mapColumn = await Promise.all(mapColumn);
  console.log('mapColumn==>', mapColumn);
  // mapColumn = mapColumn.map(ele=>ele[0]);
  mapColumn = mapColumn.filter((ele) => ele);
  mapColumn = mapColumn.map((ele) => {
    let arr = Object.keys(ele);
    return { column: ele[arr[1]], value: ele[arr[0]] };
  });
  mapColumn.forEach((ele) => (data[ele.column] = ele.value));
};
