const {
  insertRecords,
  getRecords,
  dataStringForSQL,
  dbRequest,
  isRecordExist,
  environmentConfigurationService,
} = require('../../utils/dbFunctions');
const {
  throwError,
  removeNullValueKey,
  setDateTimeFormat,
} = require('../../utils/helperFunction');

exports.upsertUserService = async (data) => {
  removeNullValueKey(data);
  let historyMessage = '';
  let user = [];
  if (data.user_uuid) {
    user = await getRecords(
      'latest_user',
      `where user_uuid='${data.user_uuid}' and email='${data.email}' and (status='ACTIVE' or status= 'INACTIVE')`,
    );
    historyMessage = `Signup success ${data.first_name} for ${data.role_uuid} role, in authentication module.`;
    if (!user.length) throwError(406, 'Invalid User');
  } else {
    const isExist = await isRecordExist('user_fact', ['email'], [data.email]);
    if (isExist) throwError(406, 'User already exist.');
    if (!data.user_password) throwError(406, 'Password should be filled.');
    data.user_password = bycrpt.hashSync(data.user_password, 10);
    data.user_uuid = uuidv4();
    historyMessage = `Signup success ${data.first_name} for ${data.role_uuid} role, in authentication module.`;
    await insertRecords('user_fact', data);
    user = await getRecords(
      'user_fact',
      `where email='${data.email}'`,
      null,
      null,
      { isPrmiaryId: true },
    );
  }
  data = { ...user[0], ...data };
  await insertRecords('user_dim', data);
  data.personal_email = data.email;
  await insertRecords('user_profile', data);
  delete data.user_password;

  const historyEntry = {
    history_uuid: uuidv4(),
    module_name: 'Authentication',
    module_uuid: data.user_uuid,
    message: historyMessage,
    created_by_uuid: data.user_uuid,
    create_ts: setDateTimeFormat('timestamp'),
  };
  console.log('Signup History: ', historyEntry);
  insertRecords('history', historyEntry);

  return data;
};

exports.userSessionService = async (data) => {
  let envConfig = await environmentConfigurationService(['MAX_LOGIN_SESSION']);
  let formValue = [
    data.user_uuid,
    data.accessToken || 'null',
    data.sessionCount,
    data.actionType,
    envConfig.MAX_LOGIN_SESSION,
  ];
  return (
    await dbRequest(`call session_handler(${dataStringForSQL(formValue)})`)
  )?.[0]?.[0]?.session_count;
};
