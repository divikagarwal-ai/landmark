const jwt = require('jsonwebtoken');
const { responser } = require('../utils/helperFunction');
const { getCountRecord } = require('../utils/dbFunctions');
const config = require('../config/server.config');
const checkAuth = (req, res, next) => {
  const token = req.header('auth-Token');
  if (!token) return res.status(401).json(responser('Token not found.'));

  jwt.verify(token, config.jwt.jwtAccessKey, async (err, user) => {
    if (err) return res.status(401).json(responser('Invalid token.'));
    let result = await getCountRecord(
      'user_session',
      `where user_uuid='${user.user_uuid}' AND access_token='${token}'`,
    );
    if (result !== 1) return res.status(401).json(responser('Invalid token.'));
    req.user = user;
    req.user['access_token'] = token;
    if (req.method === 'POST') {
      if (Array.isArray(req.body)) {
        req.body = req.body.map((item) => {
          return {
            ...item,
            created_by_uuid: user.user_uuid,
            created_by_name: user.full_name,
            modified_by_uuid: user.user_uuid,
            modified_by_name: user.full_name,
          };
        });
      } else {
        req.body = {
          ...req.body,
          created_by_uuid: user.user_uuid,
          created_by_name: user.full_name,
          modified_by_uuid: user.user_uuid,
          modified_by_name: user.full_name,
        };
      }
    }
    next();
  });
};

module.exports = checkAuth;
