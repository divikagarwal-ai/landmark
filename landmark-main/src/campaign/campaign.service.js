const serverConfig = require('../../config/server.config');
const { createCron } = require('../../utils/cronJobs');
const {
  getSystemUserToken,
  environmentConfigurationService,
  getRecords,
  dbRequest,
} = require('../../utils/dbFunctions');
const { requestApi } = require('../../utils/helperFunction');
const moment = require('moment');

exports.runCampaignsService = async () => {
  try {
    let userToken = await getSystemUserToken();
    let envConfig = await environmentConfigurationService(['WHATSAPP_NUMBER']);

    let todaysDate = moment().format('YYYY-MM-DD');
    let campaigns = await getRecords(
      'latest_market_campaign',
      `where status = 'active' and campaign_start_date >= '${todaysDate}' and campaign_end_date <= '${todaysDate}'`,
    );

    for (let campaign of campaigns) {
      let sql = campaign.campaign_sql_rule;
      let result = await dbRequest(sql);
      if (campaign.channel_type.toUpperCase() === 'WHATSAPP') {
        for (let numbers of campaign.module_channel_related_columns_name) {
          let actionPromises = result.map(async (item) => {
            let columnKey = Object.keys(item)[0];
            if (item[columnKey]['`' + numbers + '`']) {
              return await requestApi(
                serverConfig.base_url +
                  '/api/v1/conversation/whatsapp-send-messages',
                null,
                'POST',
                {
                  'Content-Type': 'application/json',
                  'auth-Token': userToken,
                },
                {
                  fromNumber: envConfig?.WHATSAPP_NUMBER,
                  toNumber: '+91' + item[columnKey]['`' + numbers + '`'],
                  is_automatic_message: 1,
                  templateName: campaign.channel_uuid,
                  objectVariables: {
                    bodyVar: campaign.module_variables_columns_name.map(
                      (clmn) => ({
                        type: 'text',
                        value: item[columnKey]['`' + clmn + '`'],
                      }),
                    ),
                  },
                },
              );
            }
          });
          await Promise.all(actionPromises);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

createCron(
  {
    hour: 9,
    minute: 0,
  },
  this.runCampaignsService,
);
