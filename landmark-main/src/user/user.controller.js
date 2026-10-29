const {
  pagination,
  filterFunctionality,
  getCountRecord,
  getRecords,
  insertRecords,
  roleFilterService,
  isEditAccess,
  isValidRecord,
  isRecordExist,
  upsertRecords,
  updateRecord,
  handleAuditColumns,
} = require('../../utils/dbFunctions');
const {
  responser,
  removeNullValueKey,
  throwError,
  getData,
  deleteKeyValuePair,
  setDateTimeFormat,
} = require('../../utils/helperFunction');
const { base_url } = require('../../config/server.config');
const { v4: uuidv4 } = require('uuid');
const bycrpt = require('bcrypt');

exports.upsertUser = async (req, res) => {
  await isEditAccess('latest_user', req.user);
  removeNullValueKey(req.body);
  let isUpadtion = false;

  const isExistRole = await isValidRecord('latest_role', {
    role_uuid: req.body.role_uuid,
    status: 'ACTIVE',
  });

  if (!isExistRole) throwError(404, 'Role not found or inactive role.');

  if (req.body.branchs && req.body.branchs.length > 0) {
    for (const branch of req.body.branchs) {
      const isExistBranch = await isValidRecord('latest_branch', {
        branch_uuid: branch.branch_uuid,
        status: 'ACTIVE',
      });
      if (!isExistBranch)
        throwError(
          404,
          `Branch ${branch.branch_name} does not exist or is inactive.`,
        );
    }
  }

  let user = [];
  if (req.body.user_uuid) {
    isUpadtion = true;
    user = await getRecords(
      'latest_user',
      `where user_uuid='${req.body.user_uuid}' and email='${req.body.email}' and (status='ACTIVE' or status= 'INACTIVE')`,
    );
    if (!user.length) throwError(406, 'Invalid User');
    if (req.body.user_password)
      req.body.user_password = bycrpt.hashSync(req.body.user_password, 10);
  } else {
    let arr = [];
    let value = [];
    if (req.body.email) {
      arr.push('email');
      value.push(req.body.email);
    }
    if (req.body.username) {
      arr.push('username');
      value.push(req.body.username);
    }
    const isExist = await isRecordExist('user_fact', arr, value);
    if (isExist) throwError(406, 'User already exist.');
    if (!req.body.user_password) throwError(406, 'Password should be filled.');
    req.body.user_password = bycrpt.hashSync(req.body.user_password, 10);
    req.body.user_uuid = uuidv4();
    await insertRecords('user_fact', req.body);
    user = await getRecords(
      'user_fact',
      `where email='${req.body.email}'`,
      null,
      null,
      { isPrmiaryId: true },
    );
  }
  req.body = { ...user[0], ...req.body };
  await insertRecords('user_dim', req.body);

  if (req.body.branches && req.body.branches.length > 0) {
    const payload = req.body.branches.map((branch) => ({
      user_uuid: req.body.user_uuid,
      branch_name: branch.branch_name,
      branch_uuid: branch.branch_uuid,
      status: req.body.status || 'ACTIVE',
      create_ts: setDateTimeFormat('timestamp'),
      created_by_uuid: req.body.created_by_uuid,
      created_by_name: req.body.created_by_name,
      modified_by_uuid: req.body.modified_by_uuid,
      modified_by_name: req.body.modified_by_name,
    }));

    await insertRecords('user_branch', payload);
  }

  req.body.personal_email = req.body.email;
  if (!isUpadtion) await insertRecords('user_profile', req.body);
  delete req.body.user_password;

  res.json(responser('User created successfully.', req.body));

  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];
      if (isUpadtion) {
        historyMessage = `${req.body.first_name} upadate has been done`;
      } else {
        historyMessage = `${req.body.first_name} you have successfuly signed up`;
      }
      const bodyData = {
        module_name: 'UserDim and UserProfile',
        module_uuid: req.body.user_uuid,
        message: historyMessage,
        module_column_name: 'user_uuid',
        created_by_uuid: req.body.user_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.upsertUserProfile = async (req, res) => {
  await isEditAccess('latest_user', req.user);
  removeNullValueKey(req.body);
  let isUpadtion = false;
  const { user_uuid } = req.body;
  let user = await getRecords('latest_user', `where user_uuid='${user_uuid}'`);
  if (!user.length) throwError(404, 'User not found.');
  user = user[0];
  let updatedData = { ...user, ...req.body };
  if (user.status !== req.body.status) {
    await updateRecord(
      'user_fact',
      { status: req.body.status },
      { user_uuid: user.user_uuid },
    );
  }

  if (req.body.branchs && req.body.branchs.length > 0) {
    let branchData = req.body.branches.map((branch) => ({
      user_uuid: req.body.user_uuid,
      branch_uuid: branch.branch_uuid,
      status: req.body.status,
    }));
    await handleAuditColumns('latest_user', branchData, ['user_uuid']);
    await insertRecords('user_branch', branchData);
  }
  await insertRecords('user_profile', updatedData);
  res.json(responser('User Profile created  successfully.', updatedData));

  (async () => {
    try {
      let historyMessage = '';
      let userInfo = (
        await getRecords(
          'latest_user',
          `where user_uuid= '${req.body.created_by_uuid}'`,
        )
      )[0];
      if (isUpadtion) {
        historyMessage = `${userInfo?.first_name} has made an update in User.`;
      } else {
        historyMessage = `${userInfo?.first_name} has created a User.`;
      }
      const bodyData = {
        module_name: 'User',
        module_uuid: req.body.user_uuid,
        message: historyMessage,
        module_column_name: 'user_uuid',
        created_by_uuid: req.body.created_by_uuid,
      };
      await getData(
        base_url + '/api/v1/history/upsert-history',
        null,
        'json',
        bodyData,
        'POST',
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

exports.getUser = async (req, res) => {
  const {
    user_uuid,
    role_uuid,
    role_group,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;
  let tableName = 'latest_user';
  let filter = filterFunctionality(
    {
      user_uuid,
      role_uuid,
      role_group,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  let userUuids = [];
  if (user_uuid !== req.user.user_uuid) {
    let roleFilter = await roleFilterService(filter, tableName, req.user);
    console.log('roleFilter==>', roleFilter);
    if (roleFilter.includes('branch_uuid')) {
      userUuids = (await getRecords('latest_user_branch', roleFilter)).map(
        (user) => user.user_uuid,
      );
      filter +=
        (filter ? ` and ` : 'Where ') +
        `user_uuid in ("${userUuids.join('","')}")`;
    }
  }
  let pageFilter = pagination(pageNo, itemPerPage);
  // let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  if (user_uuid === req.user.user_uuid && result.length) {
    result[0].module_security = await getRecords(
      'latest_module',
      `where role_uuid= '${req.user.role_uuid}'`,
    );
  }
  if (result.length === 1) {
    let userBranches = await getRecords(
      'latest_user_branch',
      filterFunctionality({ user_uuid, status: 'ACTIVE' }),
    );
    result[0].branches = userBranches.map((branch) => ({
      branch_name: branch.branch_name,
      branch_uuid: branch.branch_uuid,
    }));
  }
  deleteKeyValuePair(result, ['user_password']);
  return res.json(responser('All User', result, result.length));
};

exports.getBranch = async (req, res) => {
  const {
    branch_uuid,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_branch';
  let filter = filterFunctionality(
    {
      branch_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(responser('All Branch', result, result.length, totalRecords));
};

exports.changeUserRole = async (req, res) => {
  isEditAccess('change_role', req.user);
  const { user_uuid, role_uuid } = req.body;
  const isUserExist = await isValidRecord('latest_user', {
    user_uuid,
    status: 'ACTIVE',
  });
  if (!isUserExist) throwError(400, 'Invalid User');
  const isRoleExist = await isValidRecord('latest_role', {
    role_uuid,
    status: 'ACTIVE',
  });
  if (!isRoleExist) throwError(400, 'Invalid Role');
  let oldRecord = await getRecords(
    'user_dim',
    `where user_uuid="${user_uuid}"`,
  );
  let newRecord = { ...oldRecord[0], ...req.body };
  await insertRecords('user_dim', newRecord);
  // await upsertRecords('user_dim', req.body, `where user_uuid="${user_uuid}"`);
  res.json(responser('Role has been changed.', req.body));
};

exports.changePassword = async (req, res) => {
  const { user_uuid, password } = req.body;
  const oldRecord = await getRecords(
    'latest_user',
    filterFunctionality({ user_uuid, status: 'ACTIVE' }),
  );
  if (!oldRecord) throwError(400, 'Invalid User');
  let newRecord = { ...oldRecord[0], ...req.body };
  newRecord.user_password = bycrpt.hashSync(req.body.user_password, 10);
  await insertRecords('user_dim', newRecord);
  res.json(responser('Password has been changed.', req.body));
};
