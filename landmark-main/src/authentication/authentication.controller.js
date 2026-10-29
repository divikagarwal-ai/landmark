const {
  otpHandler,
  getRecords,
  updateRecord,
  insertRecords,
  isRecordExist,
  isValidRecord,
  isEditAccess,
  filterFunctionality,
} = require('../../utils/dbFunctions');
const {
  responser,
  throwError,
  deleteKeyValuePair,
  removeNullValueKey,
  getData,
} = require('../../utils/helperFunction');
const { otpConst } = require('../../utils/constants/otp');
const { sendEmailService } = require('../../utils/microservice_func');
const { userSessionService } = require('./authentication.service');
const bycrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/server.config');

require('dotenv').config();

exports.userVerification = async (req, res) => {
  const { email, otp, action } = req.body;
  let user = await getRecords(
    'latest_user',
    `where email='${email}' and status='UNAUTHORIZE'`,
  );
  if (!user.length) throwError(401, 'Invalid user request.');
  user = user[0];
  if (action === 'SEND') {
    let otp = await otpHandler(
      user.user_fact_unique_id,
      otpConst['user verification'],
    );
    await sendEmailService(
      [req.body.email],
      'User verification OTP',
      `Here is your user verification OTP: ${otp}.`,
    );
    return res.json(responser('Invite email has been sent.'));
  } else {
    let isValidOtp = await otpHandler(
      user.user_fact_unique_id,
      otpConst['user verification'],
      otp,
    );
    if (!isValidOtp) throwError(406, 'Invalid OTP.');
    await updateRecord('user_fact', { status: 'ACTIVE' }, { email });
    res.json(responser('User verified successfully.'));
  }
};

exports.loginUser = async (req, res, next) => {
  const otpEnabled = config.login_with_otp;
  let userDetail = await getRecords(
    'latest_user',
    `where (email='${req.body.emailOrUsername.toLowerCase()}' or username='${req.body.emailOrUsername.toUpperCase()}') AND (status='ACTIVE')`,
  );
  if (!userDetail.length)
    throwError(404, 'Email or Username or password invalid.');
  let userBranch = await getRecords(
    'latest_user_branch',
    `where user_uuid='${userDetail[0].user_uuid}'`,
    null,
    ['branch_uuid'],
  );
  const isExistRole = await isValidRecord('latest_role', {
    role_uuid: userDetail[0].role_uuid,
    status: 'ACTIVE',
  });
  if (!isExistRole) throwError(404, 'Role not found or inactive role.');

  let bol = bycrpt.compareSync(req.body.password, userDetail[0].user_password);
  if (!bol) throwError(404, 'Email or password invalid.');

  delete userDetail[0].user_password;
  delete userDetail[0].insert_ts;
  let payload = {
    full_name: userDetail[0].full_name,
    user_fact_unique_id: userDetail[0].user_fact_unique_id,
    user_uuid: userDetail[0].user_uuid,
    email: userDetail[0].email,
    role_uuid: userDetail[0].role_uuid,
    role_value: userDetail[0].role_value,
    branch_uuid: userBranch.map((branch) => branch.branch_uuid),
  };
  let jwtOption = {
    expiresIn: config.jwt.jwtAccessExpiredIn,
  };
  if (userDetail[0].role_value === 'SUPERADMIN') {
    deleteKeyValuePair(jwtOption, ['expiresIn']);
  }
  let token = jwt.sign(payload, config.jwt.jwtAccessKey, jwtOption);

  let sessionCount = await userSessionService({
    user_uuid: userDetail[0].user_uuid,
    accessToken: token,
    sessionCount: null,
    actionType: 'LOGIN',
  });

  // console.log(sessionCount, 'sessionCount');

  let isOTPPreview = false;
  if (otpEnabled === 'true') {
    let otp = await otpHandler(userDetail[0].user_uuid, otpConst.login);
    let name = userDetail[0].full_name;
    let respData = {};
    if (config.node_env === 'development') {
      respData.otp = otp;
    }
    try {
      let resp = await sendEmailService(
        [userDetail[0].email],
        'Login OTP',
        `Hi ${name}, your OTP: ${otp}`,
      );
      respData.isOTPPreview = true;
      respData.sessionCount = sessionCount;
      return res.json(responser(resp.message, respData));
    } catch (e) {
      console.log(e);
      return res.json(responser('Email has not been sent yet.', respData));
    }
  } else {
    return res.json(
      responser('Login successful.', {
        token,
        isOTPPreview,
        user: userDetail[0],
        sessionCount,
      }),
    );
  }
};

exports.validateOtpGetToken = async (req, res, next) => {
  const { email, otp } = req.body;
  let user = await getRecords(
    'latest_user',
    `where email='${email}' and status='ACTIVE'`,
    null,
    null,
    { includeUniqueId: false },
  );
  if (!user.length) throwError(401, 'Invalid user request.');
  user = user[0];
  let isValid = await otpHandler(user.user_uuid, 'LOGIN', otp);
  if (!isValid) return res.status(401).json(responser('Invalid OTP'));
  let getToken = await getRecords(
    'user_session',
    `where user_uuid='${user.user_uuid}'`,
  );
  deleteKeyValuePair(user, [
    'user_fact_id',
    'user_password',
    'created_by_uuid',
    'insert_ts',
    'create_ts',
    'user_dim_id',
  ]);
  return res.json(
    responser('Login Successfully', {
      access_token: getToken[0].access_token,
      user,
    }),
  );
};

exports.forgetPassword = async (req, res) => {
  let { email, otp, user_password, action } = req.body;
  let user = await getRecords(
    'latest_user',
    `WHERE email = '${email}' AND status = 'ACTIVE'`,
  );
  if (!user.length) throwError(401, 'Invalid user.');
  user = user[0];
  if (action === 'SEND') {
    let otp = await otpHandler(user.user_uuid, otpConst['forget password']);
    await sendEmailService(
      [req.body.email],
      'Forget password',
      `Here is your user verification OTP: ${otp}.`,
    );
    return res.json(responser('Email has been sent.'));
  } else {
    let isValid = await otpHandler(
      user.user_uuid,
      otpConst['forget password'],
      otp,
    );
    if (!isValid) throwError(400, 'Invalid otp.');
    user.user_password = bycrpt.hashSync(user_password, 10);
    await insertRecords('user_dim', user);
    return res.json(responser('Password Updated!'));
  }
};

exports.loginAsOtherUser = async (req, res) => {
  // await isViewAccess("latest_user",req.user);
  let { user_uuid } = req.query;
  let userExist = await isRecordExist(
    'latest_user',
    ['user_uuid', 'status'],
    [user_uuid, 'ACTIVE'],
  );
  if (!userExist) throwError(400, 'Invalid user or user may be inactive.');
  // let userToken = (await getRecords("user_session",`where "user_uuid=${user_uuid}"`))[0];
  let userToken = await getRecords(
    'user_session',
    filterFunctionality({
      user_uuid: user_uuid,
    }) + ' AND access_token is not null',
  );
  console.log(userToken, 'token');

  if (!userToken.length) {
    let userDetail = (
      await getRecords(
        'latest_user',
        `where user_uuid='${user_uuid}' and status<>'INACTIVE'`,
      )
    )[0];
    let userBranch = await getRecords(
      'latest_user_branch',
      `where user_uuid='${userDetail.user_uuid}'`,
      null,
      ['branch_uuid'],
    );
    console.log(userDetail, 'details');
    let payload = {
      full_name: userDetail.full_name,
      user_fact_unique_id: userDetail.user_fact_unique_id,
      user_uuid: userDetail.user_uuid,
      email: userDetail.email,
      role_uuid: userDetail.role_uuid,
      role_value: userDetail.role_value,
      branch_uuid: userBranch.map((branch) => branch.branch_uuid),
    };
    // deleteKeyValuePair(userDetail, ['user_password', 'insert_ts']);
    let token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: config.jwt.jwtAccessExpiredIn,
    });
    let sessionCount = await userSessionService({
      user_uuid: payload.user_uuid,
      accessToken: token,
      sessionCount: null,
      actionType: 'LOGIN',
    });
    userToken = {
      access_token: token,
      user_uuid,
      sessionCount: sessionCount,
    };
    res.json(responser('Successfully logged in as other user', userToken));
  } else {
    for (let usrTkn of userToken) {
      jwt.verify(
        usrTkn.access_token,
        process.env.JWT_ACCESS_SECRET,
        async (err, user) => {
          if (!err) {
            return res.json(
              responser('Successfully logged in as other user', usrTkn),
            );
          }
        },
      );
    }
  }
};

exports.logout = async (req, res) => {
  await userSessionService({
    user_uuid: req.body.user_uuid,
    accessToken: null,
    sessionCount: req.body.sessionCount || '0',
    actionType: 'LOGOUT',
  });
  return res.json(responser('Logout successfully.'));
};

exports.generateOtp = async (req, res) => {
  let { email, otp_for } = req.body;
  let isUserExist = await getRecords(
    'latest_user',
    `WHERE email = '${email}'  AND status = 'ACTIVE'`,
  );
  console.log(isUserExist[0], 'User');

  if (!isUserExist) throwError(404, 'Invalid user.');

  let otp = await otpHandler(isUserExist[0].user_uuid, otp_for);
  try {
    await sendEmailService(
      [isUserExist[0].email],
      'Forget Password OTP',
      `${otp}`,
    );
    return res.json(responser('Otp has been sent to your email'));
  } catch (e) {
    console.log('Error in email service' + e);
    throwError(500, 'Email is not send!');
  }
};
