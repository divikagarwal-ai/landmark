const {
  parseRequestParams,
  responser,
  throwError,
  setDateTimeFormat,
  getData,
  compareObjects,
  deleteKeyValuePair,
  generateCode,
  requestApi,
} = require('../../utils/helperFunction');
const {
  dbRequest,
  insertRecords,
  isRecordExist,
  getRecords,
  dataStringForSQL,
  getCountRecord,
  handleHistoryMessage,
  likeFilterSqlQuery,
  filterFunctionality,
  pagination,
  handleAuditColumns,
  getSystemUserToken,
  environmentConfigurationService,
} = require('../../utils/dbFunctions');
const moment = require('moment');
const config = require('../../config/server.config');
const { v4 } = require('uuid');
const {
  saveHistory,
  sendEmailService,
} = require('../../utils/microservice_func');
const {
  getEmailBodyByTemplateMapping,
} = require('../template/template.service');
const cron = require('../../utils/cronJobs');
require('dotenv').config();

exports.createLeadService = async (payload, user) => {
  let data = JSON.parse(JSON.stringify(payload));
  let isUpadtion = false;
  let oldRecord = {};

  if (data.leads_uuid) {
    isUpadtion = true;

    console.log('Update');
    oldRecord = (
      await getRecords(
        'latest_leads',
        filterFunctionality({ leads_uuid: data.leads_uuid }),
      )
    )[0];
    if (!oldRecord) return throwError(406, 'Invalid lead.');
    data = { ...oldRecord, ...data };
    console.log(oldRecord);
  } else {
    data.leads_uuid = v4();
    data.lead_code = generateCode({ length: 10 });
    data.create_ts = setDateTimeFormat('timestamp');
    if (data.assigned_to_id) {
      let checkCsr = await getCountRecord(
        'latest_user',
        `where user_fact_id='${data.assigned_to_id}'`,
      );
      if (checkCsr !== 1) return throwError(406, 'Invalid User.');
    } else {
      // let assigned_to_id = (
      //   await dbRequest(`SELECT user_fact_id from(select count(leads_id) cnt,user_fact_id  from (
      //       select ll.leads_id ,ifnull(ll.assigned_to_id,0) assigned_to_id, lu.role_uuid,lu.user_fact_id from latest_user lu
      //       left join latest_leads ll  on lu.user_fact_id=ll.assigned_to_id where role_uuid="1a2209e9-21f7-4448-b144-611bd39c8517") a
      //       group by user_fact_id order by cnt,user_fact_id) b limit 1;`)
      // );
      let admin_uuid = (
        await getRecords('latest_role', `WHERE role_value="ADMIN"`)
      )[0].role_uuid;

      // let assigned_to_id =
      //   await dbRequest(`SELECT user_fact_id from(select count(leads_id) cnt,user_fact_id  from (
      //           select ll.leads_id ,ifnull(ll.assigned_to_id,0) assigned_to_id, lu.role_uuid,lu.user_fact_id from latest_user lu
      //           left join latest_leads ll  on lu.user_fact_id=ll.assigned_to_id where role_uuid="${admin_uuid}") a
      //           group by user_fact_id order by cnt,user_fact_id) b limit 1;`);

      // console.log('Assigned To ID Result:', assigned_to_id);
      // data.assigned_to_id = assigned_to_id[0].user_fact_id;
    }
  }
  //   const maxUniqueIdResult = await dbRequest('SELECT max(lead_unique_id) as maxUniqueId FROM leads');
  //   console.log('maxUniqueIdResult:', maxUniqueIdResult);
  //   const maxUniqueId = maxUniqueIdResult.result[0].maxUniqueId ?? 0
  await handleAuditColumns('latest_leads', data, ['leads_uuid']);
  const result = await insertRecords('leads', data);

  // <---------------- history entry ---------------->
  if (data.status === 'BOOKED' && !data?.remarks) {
    data.remarks = `Booked by ${user.full_name}`;
  }
  saveHistory(
    {
      oldRecord,
      newRecord: data,
    },
    'leads',
    'leads_uuid',
    'LEAD',
    result.insertId,
    data?.remarks,
    user,
  );

  return responser('Lead created successfully.', data);
};

exports.sendWhatsappTemplatesInLead = async (data, customerRecords, user) => {
  try {
    const userToken = await getSystemUserToken();
    let leadStatus = {
      ongoing: 'intro_message',
      cancelled: 'cancelled_event',
      booked: 'booking_confirmation',
    };
    if (leadStatus[data.status.toLowerCase()]) {
      let booking = (
        await getRecords(
          'latest_booking',
          `where leads_uuid="${data.leads_uuid}"`,
        )
      )[0];
      if (data.status.toLowerCase() === 'booked') {
        if (data.email) {
          let { subject, body } = await getEmailBodyByTemplateMapping(
            'LEAD',
            'UPSERT_LEAD',
            { latest_leads: data },
          );
          await sendEmailService([data.email], subject, body);
        }
      }
      console.log('Booking:', booking);
      console.log('cancelling');

      if (data.status.toLowerCase() === 'cancelled' && booking) {
        console.log('Booking Cancelled');

        await requestApi(
          config.base_url + '/api/v1/occupancy/cancel-booking',
          null,
          'POST',
          {
            'Content-Type': 'application/json',
            'auth-Token': user.access_token,
          },
          {
            booking_uuid: booking.booking_uuid,
          },
        );
      }
      // if (!booking) {
      await requestApi(
        config.base_url + '/api/v1/conversation/whatsapp-send-messages',
        null,
        'POST',
        { 'Content-Type': 'application/json', 'auth-Token': userToken },
        {
          toNumber: data.contact_number_one,
          templateName: leadStatus[data.status.toLowerCase()],
          is_automatic_message: 1,
          reference_uuid_column_name: 'leads_uuid',
          reference_uuid_column_value: data.leads_uuid,
        },
      );
      if (data.contact_number_two) {
        await requestApi(
          config.base_url + '/api/v1/conversation/whatsapp-send-messages',
          null,
          'POST',
          { 'Content-Type': 'application/json', 'auth-Token': userToken },
          {
            toNumber: data.contact_number_two,
            templateName: leadStatus[data.status.toLowerCase()],
            is_automatic_message: 1,
            reference_uuid_column_name: 'leads_uuid',
            reference_uuid_column_value: data.leads_uuid,
          },
        );
      }
      // }
    }
  } catch (err) {
    console.log('<================error===============>', err);
  }
};

exports.settleBookingInLead = async (data, customerRecords, user) => {
  // check for food menu

  let foodMenu = (
    await getRecords(
      'latest_added_lead_food_menu',
      filterFunctionality({
        leads_uuid: data.leads_uuid,
        status: 'ACTIVE',
      }),
    )
  )[0];
  if (foodMenu) data.food_menu = foodMenu.menu_json;

  let booking = (
    await getRecords('latest_booking', `where leads_uuid="${data.leads_uuid}"`)
  )[0];
  if (booking && booking.status.toUpperCase() !== data.status.toUpperCase()) {
    if (data.status.toUpperCase() === 'BOOKED') {
      try {
        await requestApi(
          config.base_url + '/api/v1/occupancy/booking',
          null,
          'POST',
          {
            'Content-Type': 'application/json',
            'auth-Token': user.access_token,
          },
          {
            customer_fact_uuid: customerRecords.customer_fact_uuid,
            from_date: data.function_date,
            to_date: data.function_date,
            leads_uuid: data.leads_uuid,
            event_time: data.event_time,
            venue_uuid: data.preferred_venue_uuid,
            venue_name: data.preferred_venue,
            event_time_uuid: data.event_time_uuid,
            food_menu: data.food_menu,
            customer_name: data.name_of_guest,
            customer_email: data.email,
            customer_mobile_no: data.contact_number_one,
            total_price: '10000',
            total_guest: data.number_of_guests,
          },
        );
      } catch (err) {
        console.error('err==>', err);
        throwError(
          JSON.parse(err?.message)?.status,
          JSON.parse(err?.message)?.message?.message?.message,
        );
      }
    } else if (booking.status.toUpperCase() === 'BOOKED') {
      try {
        await requestApi(
          config.base_url + '/api/v1/occupancy/cancel-booking',
          null,
          'POST',
          {
            'Content-Type': 'application/json',
            'auth-Token': user.access_token,
          },
          {
            booking_uuid: booking.booking_uuid,
          },
        );
      } catch (err) {
        console.error('err==>', err);
        throwError(
          JSON.parse(err?.message)?.status,
          JSON.parse(err?.message)?.message?.message?.message,
        );
      }
    }
  }
  if (!booking) {
    try {
      await requestApi(
        config.base_url + '/api/v1/occupancy/booking',
        null,
        'POST',
        {
          'Content-Type': 'application/json',
          'auth-Token': user.access_token,
        },
        {
          customer_fact_uuid: customerRecords.customer_fact_uuid,
          from_date: data.function_date,
          to_date: data.function_date,
          leads_uuid: data.leads_uuid,
          event_time: data.event_time,
          venue_uuid: data.preferred_venue_uuid,
          venue_name: data.preferred_venue,
          event_time_uuid: data.event_time_uuid,
          food_menu: data.food_menu,
          customer_name: data.name_of_guest,
          customer_email: data.email,
          customer_mobile_no: data.contact_number_one,
          total_price: '10000',
          total_guest: data.number_of_guests,
        },
      );
    } catch (err) {
      console.error('err==>', err);
      throwError(
        JSON.parse(err?.message)?.status,
        JSON.parse(err?.message)?.message?.message?.message,
      );
    }
  }
};

exports.sendStatusReportEmail = async () => {
  let envConfig = await environmentConfigurationService([
    'STATUS_REPORT_EMAIL',
    'SEND_STATUS_REPORT',
  ]);
  if (envConfig.SEND_STATUS_REPORT === 'true') {
    try {
      let userToken = await getSystemUserToken();
      let leadStatusCounts = await requestApi(
        config.base_url + '/api/v1/leads/get-status-leads',
        {
          type: 'count',
          to_date: moment().format('YYYY-MM-DD'),
          from_date: moment().format('YYYY-MM-DD'),
          data_wise: 'Lead_Month',
        },
        'GET',
        {
          'Content-Type': 'application/json',
          'auth-Token': userToken,
        },
        {},
      );
      console.log('leadStatusCounts==>', leadStatusCounts);
      let { subject, body } = await getEmailBodyByTemplateMapping(
        'LEAD',
        'STATUS_REPORT',
        {
          latest_leads: {
            ...leadStatusCounts.data.statusCounts,
            current_date: moment().format('DD MMMM YYYY'),
          },
        },
      );
      await sendEmailService(
        [envConfig.STATUS_REPORT_EMAIL],
        subject,
        body,
        null,
        null,
        null,
        ['arpit.set@gmail.com', 'krishna@edgenroots.net'],
      );
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
    }
  } else {
    console.log('Status Report Email is not enabled');
  }
};

(() => {
  if (process.env.STATUS_REPORT_HOUR && process.env.STATUS_REPORT_MINUTE) {
    console.log('Creating cron');
    cron.createCron(
      {
        hour: parseInt(process.env.STATUS_REPORT_HOUR),
        minute: parseInt(process.env.STATUS_REPORT_MINUTE),
      },
      this.sendStatusReportEmail,
    );
  } else {
    console.log('Status Report hour or minutes are not set');
  }
})();
