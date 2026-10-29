require('dotenv').config();
module.exports = {
  NODE_CLUSTER: process.env.NODE_CLUSTER,
  CPU_USAGE: process.env.CPU_USAGE,
  PORT: process.env.PORT,
  jwt: {
    jwtAccessKey: process.env.JWT_ACCESS_SECRET,
    jwtAccessExpiredIn: process.env.JWT_ACCESS_EXPIRED_IN,
    jwtRefreshKey: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiredIn: process.env.JWT_REFRESH_EXPIRED_IN,
  },
  crypto: {
    cryptoSecret: process.env.CRYPTO_SECRET,
  },
  genai: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  webhook: {
    webhookApiKey: process.env.WEBHOOK_API_KEY,
  },
  server_timezone: {
    timezone: process.env.SERVER_TIMEZONE,
  },
  cron_services: {
    cron_services_url: process.env.CRON_SERVICES,
  },
  bcrypt: {
    bcryptSalt: 10,
  },
  base_url: process.env.DEV_SERVER
    ? process.env.DEV_SERVER + ':' + process.env.PORT
    : process.env.STAGGING_SERVER
      ? process.env.STAGGING_SERVER
      : process.env.PROD_SERVER,
  swagger_develope_contact: process.env.DEVELOP_EMAIL,
  login_with_otp: process.env.OTP_AUTHENTICATION,
  node_env: process.env.NODE_ENV,
  DREAM_LABS_AUTH_KEY: process.env.DREAM_LABS_AUTH_KEY,
};
