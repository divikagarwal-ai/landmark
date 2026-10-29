const fetch = require('cross-fetch');
const { v4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { asIs } = require('sequelize');
const { ToWords } = require('to-words');
const { Readable } = require('stream');
const FormData = require('form-data');
const crypto = require('crypto');
const axios = require('axios');

require('dotenv').config();

exports.throwError = (status, message) => {
  throw new Error(JSON.stringify({ status, message }));
};

/**
 * Return object reponse.
 * @param {string} msg Any message.
 * @param {array} data Data will be send in array of object.
 * @param {number} currentCountRecord Current records comes from DB service.
 * @param {number} totalCountRecord Total records comes from DB service.
 * @param {string} metaData Any meta data.
 * @returns {Promise<array>} array of object.
 */
exports.responser = (
  msg,
  data,
  currentCountRecord,
  totalCountRecord,
  metaData,
) => {
  return {
    message: msg || undefined,
    totalRecords: totalCountRecord, // count of total record for pagination
    currentRecords: currentCountRecord, // count of current sending record for pagination
    data: data || undefined,
    meta: metaData || undefined,
  };
};

/**
 * Request API
 * @param {string} url
 * @param {object} params
 * @param {("json"|"text"|"buffer"|"html")} response_type
 * @param {object} bodyData
 * @param {("GET"|"POST"|"PUT"|"DELETE")} method
 * @param {object} header
 * @returns
 */
exports.getData = async (
  url,
  params = null,
  response_type = 'json',
  bodyData = null,
  method = 'POST',
  header = null,
) => {
  let Url = new URL(url);
  for (let k in params) {
    Url.searchParams.append(k, params[k]);
  }
  console.log('hitting url:', url);
  let req = await fetch(bodyData ? url : Url, {
    method: bodyData ? method : 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      ...header,
    },
    [bodyData ? 'body' : null]: JSON.stringify(bodyData),
  });
  let res = undefined;
  if (response_type === 'json') res = await req.json();
  if (response_type === 'text') res = await req.text();
  if (response_type === 'buffer') res = await req.arrayBuffer();
  if (response_type === 'html') res = await req.html();
  if (req.status >= 400) {
    throw new Error(
      JSON.stringify({ status: req.status, message: res?.message }),
    );
  }
  return res;
};

/**
 * Sends a request to the specified API endpoint.
 * @param {string} url - The URL of the API endpoint.
 * @param {Array<string>|object} paramOrQuery - eg. param ["<uuid>","<id>"] or query {<key>:<value>}.
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method - The HTTP method to be used for the request.
 * @param {{
 * "Content-Type":"application/json"|"multipart/form-data"
 * }} headers - The default header is application/json.
 * @param {object|Array<{files:{name:string,data:Buffer}[],options}>} body - The body of the request.
 * @return {object} The response from the API endpoint.
 */
exports.requestApi = async (
  url,
  paramOrQuery,
  method = 'GET',
  headers = {},
  body = {},
) => {
  try {
    console.log('url==>', url);
    // Construct the base URL
    const Url = new URL(url);

    // Handle params or query strings
    if (typeof paramOrQuery === 'object') {
      if (Array.isArray(paramOrQuery)) {
        for (const segment of paramOrQuery) {
          Url.pathname += `/${segment}`;
        }
      } else {
        for (const key in paramOrQuery) {
          Url.searchParams.append(key, paramOrQuery[key]);
        }
      }
    } else if (paramOrQuery) {
      throw new Error('paramOrQuery must be an array of strings or an object.');
    }

    const requestPayload = {
      method,
      url: Url.href,
      headers: {},
    };

    // Handle multipart/form-data
    if (headers['Content-Type'] === 'multipart/form-data') {
      const form = new FormData();

      if (body.files) {
        body.files.forEach((file) => {
          const stream = Readable.from(file.data);
          form.append('files', stream, { filename: file.name });
        });
      }

      Object.keys(body).forEach((key) => {
        if (key !== 'files') {
          form.append(key, JSON.stringify(body[key]));
        }
      });

      requestPayload.headers = { ...form.getHeaders(), ...headers };
      requestPayload.data = form;
    } else {
      // Default to JSON
      requestPayload.headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        ...headers,
      };

      if (method !== 'GET') {
        requestPayload.data = JSON.stringify(body);
      }
    }

    // Make the API call
    console.group('Request API');
    console.log('URL:', requestPayload.url);
    console.log('Payload:', requestPayload);
    console.groupEnd('Request API');

    const response = await axios(requestPayload);
    return response.data;
  } catch (error) {
    console.error('Error in requestApi:', error.message);
    if (error.response) {
      throw new Error(
        JSON.stringify({
          status: error.response.status,
          message: error.response.data || error.message,
        }),
      );
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Give All the files within Directory.
 * @param {string} endPath Path of the file from base directory.
 * @param {string} msg Any message you want to show.
 * @returns {Promise<Array<string>>} Array of string.
 */
exports.readDirectory = async (endPath, msg = null) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, `/../${endPath}`), async (err, files) => {
      if (msg) console.log('\n\n', colors.yellow.bold(msg));
      if (err) {
        console.log('Unable to scan directory: ' + err);
        return reject(0);
      }
      //listing all files using forEach
      return resolve(files);
    });
  });
};

/**
 * Read All content form the file.
 * @param {string} endPath Path of the file from base directory.
 * @param {string} fileName Name of the file.
 * @param {string} msg Any message you want to show.
 * @returns {Promise<string|number>} Array of string.
 */
exports.readFileContent = async (endPath, fileName, msg = undefined) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, `/../${endPath}/${fileName}`),
      'utf-8',
      async (err, file) => {
        if (msg) console.log('\n\n', colors.yellow.bold(msg));
        if (err) {
          console.log('Unable to scan directory: ' + err);
          return reject(0);
        }
        //listing all files using forEach
        return resolve(file.toLocaleString());
      },
    );
  });
};

/**
 * Return datetime or timestamp format.
 * @param {"datetime"|"timestamp"|"date"} type Type will be datetime or timestamp.
 * @param {Date} dateTime Datetime will be in iso stream.
 * @returns {string} String format of datetime.
 */
exports.setDateTimeFormat = (type, dateTime) => {
  switch (type) {
    case 'datetime':
      return moment(dateTime).format('YYYY-MM-DD HH-mm-ss');
    case 'timestamp':
      return moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
    case 'date':
      return moment(dateTime).format('YYYY-MM-DD');
  }
};

async function validateFunc(schemaName, dataToValidate) {
  try {
    const value = await schemaName.validateAsync(dataToValidate);
    return { value };
  } catch (error) {
    console.log('error in schema', error);
    error = { status: 406, message: error.details[0].message };
    throw error;
  }
}

exports.requestErrorHandlingDecorator = (validatorSchema, handler, options) => {
  return async (req, res, next) => {
    console.log('Req Body:', JSON.stringify(req.body, null, 2));
    console.log('Req Query:', JSON.stringify(req.query, null, 2));
    let start = performance.now();
    try {
      let body = req?.body;
      if (validatorSchema) {
        let value = await validateFunc(
          validatorSchema,
          Object.keys(body).length ? req.body : req.query,
        );
        if (body) {
          if (Array.isArray(value.value)) {
            req.body = value.value.map((item) => {
              return {
                ...item,
                created_by_uuid: req.user.user_uuid, // handle create_by_id for every table
              };
            });
          } else req.body = { ...value.value };
        } else req.query = { ...value.value };
      }
      await handler(req, res);
      let end = performance.now();
      console.log(`Processing time: ${(end - start) / 1000} seconds`);
    } catch (error) {
      console.log('Error catch by decorator:', error);
      try {
        error = JSON.parse(error.message);
      } catch (e) {}
      let end = performance.now();
      console.log(`Processing time: ${(end - start) / 1000} seconds`);
      return res
        .status(parseInt(error.status) || 500)
        .json(this.responser(error.message));
    }
  };
};

/**
 * Generate Unique Code
 * @param {{
 * length:number,
 * numOnly:boolean,
 * uuid: boolean
 * }} options
 * @returns {string} Unique code of string.
 */
exports.generateCode = (
  options = { length: 6, numOnly: false, uuid: false },
) => {
  const { length, numOnly, uuid } = options;
  if (uuid) {
    return v4();
  }
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomCode = '';

  for (let i = 0; i < length; i++) {
    if (numOnly) {
      randomCode += Math.floor(Math.random() * 10);
    } else {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomCode += characters.charAt(randomIndex);
      randomCode = randomCode.toUpperCase();
    }
  }

  return randomCode;
};

exports.removeNullValueKey = (data, options = { removeEmptyString: false }) => {
  for (let key in data) {
    if (data[key] === null || data[key] === undefined) delete data[key];
    if (options.removeEmptyString && !data[key]) delete data[key];
  }
};

exports.deleteKeyValuePair = (payload, deleteKey = []) => {
  if (Array.isArray(payload)) {
    payload.forEach((obj) => {
      deleteKey.forEach((key) => {
        delete obj[key];
      });
    });
  } else
    deleteKey.forEach((key) => {
      delete payload[key];
    });
};

/**
 * Convert number to currency
 * @param {number} value number value
 * @param {{
 * localeCode: ("en-US"|"en-IN"),
 * currency:("INR"|"USD")
 * }} options Default localeCode and currency is set to Indian standard.
 * @returns
 */
exports.numberToCurrency = (value, options) => {
  let formatter = new Intl.NumberFormat(options?.localeCode || 'en-IN', {
    currency: options.currency || 'INR',
    style: 'currency',
  });
  return formatter.format(value);
};

/**
 * Convert Currency to words
 * @param {number} currency
 * @param {{
 * localeCode:("en-IN"|"en-US")}} options
 * @returns
 */
exports.currencyToWords = (currency, options) => {
  let toWords = new ToWords({ localeCode: options.localeCode });
  return toWords.convert(currency, { currency: true });
};

exports.findKeysWithPhrase = (obj, phrase) => {
  let keysWithPhrase = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && key.includes(phrase)) {
      keysWithPhrase.push(key);
    }
  }
  return keysWithPhrase;
};

exports.compareObjects = (obj1, obj2) => {
  let changes = {};
  function isEqual(value1, value2) {
    if (Array.isArray(value1) && Array.isArray(value2)) {
      // Compare arrays by converting them to strings or use a deep equality check
      return (
        value1.length === value2.length &&
        value1.every((item, index) => item === value2[index])
      );
    }
    if (!value1 && !value2) return true;
    return value1 === value2;
  }
  // Combine keys from both objects to ensure all keys are checked
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  allKeys.forEach((key) => {
    if (!isEqual(obj1[key], obj2[key])) {
      changes[key] = {
        old_value: obj1[key],
        new_value: obj2[key],
      };
    }
  });
  return changes;
};

exports.cipherEncryption = (payload) => {
  let KEY = process.env.CIPHER_KEY;
  const cipher = crypto.createCipheriv(
    'aes-256-ecb',
    Buffer.from(KEY, 'hex'),
    null,
  );
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

exports.decipherDecryption = (payload) => {
  let KEY = process.env.CIPHER_KEY;
  const decipher = crypto.createDecipheriv(
    'aes-256-ecb',
    Buffer.from(KEY, 'hex'),
    null,
  );
  let decrypted = decipher.update(payload, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

exports.evaluateConditionWithPayload = (conditionString, payloads) => {
  console.log('payloads:', payloads);
  let variables = conditionString.match(/@@[a-z0-9._]*/g);
  variables.forEach((v, i) => {
    let rgx = new RegExp(v, 'g');
    v = v.replace('@@', '');
    let splitArr = v.split('.');
    let traverseObjectString = splitArr.map((part) => `?.${part}`).join('');
    traverseObjectString = 'payloads' + traverseObjectString;
    console.log(
      'object string:',
      traverseObjectString,
      '\nreplaced value:',
      eval(traverseObjectString),
    );
    let evalValue = eval(traverseObjectString);
    console.log('before replace condition string:', conditionString);
    conditionString = conditionString.replace(
      rgx,
      typeof evalValue === 'string' ? evalValue.toUpperCase() : evalValue,
    );
    console.log('After replace condition string:', conditionString);
  });
  let resp = { condition: conditionString, result: eval(conditionString) };
  console.log('resp of evaluate condition with payload:', resp);
  return resp;
};
