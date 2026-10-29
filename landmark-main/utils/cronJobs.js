const cron = require('node-cron');
const {
  getOutletSalesReport,
} = require('../src/accounting/accounting.controller');

const {
  deleteKeyValuePair,
  throwError,
  removeNullValueKey,
} = require('./helperFunction');
const { cron_services, server_timezone } = require('../config/server.config');

const { getRecords } = require('./dbFunctions');
const {
  allWorkflowCronConditions,
} = require('../src/workflow/workflow.service');

// Function to schedule sales report for an outlet
const scheduleSalesReport = async (outlet_uuid) => {
  const outlet = await dbRequest(
    `
    SELECT 
      TIME_FORMAT(CONVERT_TZ(outlet_closing_time, '+00:00', '+05:30'), '%H:%i') as closing_time
    FROM latest_outlet 
    WHERE outlet_uuid = ?
  `,
    [outlet_uuid],
  );

  if (outlet.length) {
    const [hours, minutes] = outlet[0].closing_time.split(':');

    // Schedule job to run at outlet closing time
    cron.schedule(`${minutes} ${hours} * * *`, async () => {
      try {
        await getOutletSalesReport(
          { query: { outlet_uuid } },
          { json: () => {} },
        );
      } catch (error) {
        console.error(
          `Failed to send sales report for outlet ${outlet_uuid}:`,
          error,
        );
      }
    });
  }
};

function convertToCronString(scheduler) {
  let cronStrObj = {
    second: '*',
    minute: '*',
    hour: '*',
    date: '*',
    month: '*',
    week: '*',
    ...scheduler,
  };
  if (cronStrObj.repeatEvery) {
    deleteKeyValuePair(cronStrObj, ['repeatEvery']);
    cronStrObj = Object.values(cronStrObj)
      .map((ele) => {
        if (ele !== '*' && ele !== '0') {
          return `*/${ele}`;
        } else {
          return ele;
        }
      })
      .join(' ');
  } else cronStrObj = Object.values(cronStrObj).join(' ');
  cronStrObj = cronStrObj.replace(/^[* ]+/, '');
  if (cronStrObj.startsWith('/')) {
    cronStrObj = '*' + cronStrObj;
  }
  if (!cron.validate(cronStrObj)) throwError(400, 'Cron scheduler is invalid');
  return cronStrObj;
}

/**
 * Represents a user.
 * @typedef {Object} Scheduler
 * @property {string|null} second - Valid 0-59.
 * @property {string|null} minute - Valid 0-59.
 * @property {string|null} hour - Valid 0-23.
 * @property {string|null} date - Valid 1-31.
 * @property {string|null} month - Valid 1-12 (or names).
 * @property {string|null} week - Valid 0-7 (or names, 0 or 7 are sunday).
 * @property {boolean} repeatEvery - True or False.
 */

/**
 * Create Cron
 * @param {Scheduler} scheduler
 * @param {Function} callBack
 * @param {{
 * name: string|null
 * timezone: string| null
 * scheduled: boolean
 * }} options
 */
exports.createCron = (scheduler, callBack, options) => {
  removeNullValueKey(scheduler);
  if (cron_services.cron_services_url !== 'true') {
    console.info(
      'CRON services is turn off, turn on by set CRON_SERVICES=true in .env',
    );
    return;
  }
  let cronSchedulerString = convertToCronString(scheduler);
  let cronName = cron.schedule(cronSchedulerString, callBack, options);
  return cronName;
};

// exports.restartAllCrons = async()=>{
//   let workflowBasics = (await getRecords("latest_workflow_basic",`where run_as="CRON" AND status="ACTIVE"`)).result;
//   let csioCron = (await getRecords("latest_csio_cron",`where status="ACTIVE"`)).result;
//   if(!workflowBasics.length){
//       console.log("No CRONs found for workflow");
//   }
//   if(!csioCron.length){
//       console.log("No CRONs found for csio");
//   }
//   for(let ele of workflowBasics){
//       this.createCron(ele.cron_schedule_at,()=>allWorkflowCronConditions(ele.workflow_basic_code),{name:ele.cron_code,timezone:server_timezone.timezone});
//   }
//   for(let ele of csioCron){
//       this.createCron(ele.cron_schedule_at,csioCronServive,{name:ele.csio_cron_code,timezone:server_timezone.timezone});
//   }
// }

exports.cronJob = (cronCode, payload) => {
  const { scheduler, callBack, status } = payload;
  removeNullValueKey(scheduler);
  convertToCronString(scheduler);
  let cronJobs = cron.getTasks();
  let newCron = true;
  cronJobs.forEach((crn) => {
    if (crn.options.name === cronCode) {
      newCron = false;
      crn.stop();
      if (status === 'ACTIVE')
        this.createCron(scheduler, callBack, {
          name: cronCode,
          timezone: 'America/Toronto',
        });
    }
  });
  if (newCron && status === 'ACTIVE') {
    this.createCron(scheduler, callBack, {
      name: cronCode,
      timezone: 'America/Toronto',
    });
  }
};
