const { dbRequest } = require('../../utils/dbFunctions');
const { responser } = require('../../utils/helperFunction');

exports.leadFollowupsAnalytics = async (req, res) => {
  const { from_date, to_date, day_type } = req.query;

  // Create an array of all dates within the last 7 days
  const dateList = [];
  const currentDateCopy = new Date(to_date);
  const tillDate = new Date(from_date);

  while (currentDateCopy >= tillDate) {
    dateList.push(currentDateCopy.toISOString().slice(0, 10));
    currentDateCopy.setDate(currentDateCopy.getDate() - 1);
  }
  let filter = '';

  switch (day_type) {
    case 'UPCOMING':
      let afterDate = new Date().toISOString().slice(0, 10);
      filter += `AND followup_date > '${afterDate}' `;
      break;
    case 'MISSED':
      let beforeDate = new Date().toISOString().slice(0, 10);
      filter += ` AND (status<> 'BOOKED' or status<>'CANCELLED') AND followup_date < '${beforeDate}' `;
      break;
    case 'DONE':
      filter += " AND status='BOOKED'";
      break;
  }

  let sql = ` SELECT DATE_FORMAT(followup_date, '%Y-%m-%d') AS x, COUNT(leads_id) AS y 
        FROM latest_leads 
        WHERE followup_date BETWEEN '${from_date}' AND '${to_date}'
        ${filter}
        GROUP BY DATE_FORMAT(followup_date, '%Y-%m-%d') 
        ORDER BY DATE_FORMAT(followup_date, '%Y-%m-%d') DESC`;
  let result = await dbRequest(sql);

  // Create a map to store the data with dates as keys
  const leadDataMap = new Map(result.map((entry) => [entry.x, entry.y]));

  // Fill in missing dates with 0
  for (const date of dateList) {
    if (!leadDataMap.has(date)) {
      leadDataMap.set(date, 0);
    }
  }
  // Create an array with the merged data
  const mergedLead = Array.from(leadDataMap, ([x, y]) => ({ x, y }));

  // Sort the merged data by 'day'
  mergedLead.sort((a, b) => a.x.localeCompare(b.x));

  res.json(responser('Lead Followups', { lead: mergedLead }));
};

exports.leadAnalytics = async (req, res) => {
  const { from_date, to_date, day_type } = req.query;

  // Create an array of all dates within the last 7 days
  const dateList = [];
  const currentDateCopy = new Date(to_date);
  const tillDate = new Date(from_date);

  while (currentDateCopy >= tillDate) {
    dateList.push(currentDateCopy.toISOString().slice(0, 10));
    currentDateCopy.setDate(currentDateCopy.getDate() - 1);
  }
  let filter = '';

  switch (day_type) {
    case 'UPCOMING':
      let afterDate = new Date().toISOString().slice(0, 10);
      filter += `AND create_ts > '${afterDate} 23:59:59' `;
      break;
    case 'DONE':
      filter += ` AND status= 'BOOKED' `;
      break;
    case 'MISSED':
      let beforeDate = new Date().toISOString().slice(0, 10);
      filter += ` AND status='CANCELLED' AND create_ts<'${beforeDate} 00:00:00' `;
      break;
  }

  let sql = ` SELECT DATE_FORMAT(create_ts, '%Y-%m-%d') AS x, COUNT(leads_id) AS y 
         FROM latest_leads 
         WHERE create_ts BETWEEN '${from_date} 00:00:00' AND '${to_date} 23:59:59'
         ${filter}
         GROUP BY DATE_FORMAT(create_ts, '%Y-%m-%d') 
         ORDER BY DATE_FORMAT(create_ts, '%Y-%m-%d') DESC`;
  let result = await dbRequest(sql);

  // Create a map to store the data with dates as keys
  const leadDataMap = new Map(result.map((entry) => [entry.x, entry.y]));

  // Fill in missing dates with 0
  for (const date of dateList) {
    if (!leadDataMap.has(date)) {
      leadDataMap.set(date, 0);
    }
  }
  // Create an array with the merged data
  const mergedLead = Array.from(leadDataMap, ([x, y]) => ({ x, y }));

  // Sort the merged data by 'day'
  mergedLead.sort((a, b) => a.x.localeCompare(b.x));

  res.json(responser('Lead Followups', { lead: mergedLead }));
  // const {from_date,to_date} = req.query;
  // let sql = ` SELECT DATE_FORMAT(create_ts, '%Y-%m-%d') AS x, COUNT(leads_id) AS y
  //     FROM latest_leads
  //     WHERE create_ts BETWEEN '${from_date} 00:00:00' AND '${to_date} 23:59:59'
  //     GROUP BY DATE_FORMAT(create_ts, '%Y-%m-%d')
  //     ORDER BY DATE_FORMAT(create_ts, '%Y-%m-%d') DESC`;
  // let result = await dbRequest(sql);
  // res.json(responser("Lead Followups",result));
};

exports.ongoingLeadAnalytics = async (req, res) => {
  const { year } = req.query;
  const selectedYear = year || new Date().getFullYear();

  // SQL query to get monthly ongoing leads count
  let sql = `
    SELECT 
      DATE_FORMAT(create_ts, '%Y-%m') AS x,
      COUNT(leads_id) AS y
    FROM latest_leads 
    WHERE 
      YEAR(create_ts) = ${selectedYear}
      AND status = 'ONGOING'
    GROUP BY DATE_FORMAT(create_ts, '%Y-%m')
    ORDER BY x ASC`;

  let result = await dbRequest(sql);

  // Create an array of all months in the year
  const monthList = [];
  for (let month = 1; month <= 12; month++) {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    monthList.push(`${selectedYear}-${monthStr}`);
  }

  // Create a map to store the data with months as keys
  const leadDataMap = new Map(result.map((entry) => [entry.x, entry.y]));

  // Fill in missing months with 0
  for (const month of monthList) {
    if (!leadDataMap.has(month)) {
      leadDataMap.set(month, 0);
    }
  }

  // Create an array with the merged data
  const mergedLead = Array.from(leadDataMap, ([x, y]) => ({ x, y }));

  // Sort the merged data by month
  mergedLead.sort((a, b) => a.x.localeCompare(b.x));

  res.json(responser('Ongoing Lead Analytics', { lead: mergedLead }));
};

exports.reviewKeywordCountAnalytics = async (req, res) => {
  const { year, month } = req.query;
  const selectedYear = year || new Date().getFullYear();
  const selectedMonth = month ? parseInt(month) : null;

  // Build the date filter
  let dateFilter = `YEAR(date) = ${selectedYear}`;
  if (selectedMonth) {
    dateFilter += ` AND MONTH(date) = ${selectedMonth}`;
  }

  // SQL query to get keyword counts by category and sentiment type
  let sql = `
    SELECT 
      tag AS category,
      type AS sentiment_type,
      COUNT(*) as count
    FROM review_keywords 
    WHERE ${dateFilter}
    GROUP BY tag, type
    ORDER BY count DESC`;

  let result = await dbRequest(sql);

  // Process the results to calculate percentages
  const categoryData = {};

  // Initialize the categories
  result.forEach((item) => {
    if (!categoryData[item.category]) {
      categoryData[item.category] = {
        category: item.category,
        positive: 0,
        negative: 0,
        total: 0,
      };
    }
  });

  // Fill in the counts
  result.forEach((item) => {
    categoryData[item.category][item.sentiment_type] = item.count;
    categoryData[item.category].total += item.count;
  });

  // Calculate percentages
  const finalData = Object.values(categoryData).map((item) => {
    const total = item.total;
    return {
      category: item.category,
      positive_percentage:
        total > 0 ? parseFloat(((item.positive / total) * 100).toFixed(1)) : 0,
      negative_percentage:
        total > 0
          ? parseFloat((-1 * ((item.negative / total) * 100)).toFixed(1))
          : 0,
    };
  });

  // Sort by total count (optional)
  finalData.sort(
    (a, b) =>
      Math.abs(b.positive_percentage) +
      Math.abs(b.negative_percentage) -
      (Math.abs(a.positive_percentage) + Math.abs(a.negative_percentage)),
  );

  res.json(
    responser('Review Keyword Sentiment Analysis', { categories: finalData }),
  );
};
