const { throwError } = require('../../utils/helperFunction');

exports.calculateTotals = (data) => {
  let subTotal = 0;
  let tax1Total = 0;
  let tax2Total = 0;
  let commissionTotal = 0;
  let netPayableTotal = 0;
  let amountDue = 0;
  let totalDue = 0;

  const amountPaid = parseFloat(data.amount_paid || '0');
  const financefees = parseFloat(data.financed_fee || '0');

  data.invoice_details.forEach((invoice) => {
    if (invoice.status === 'ACTIVE') {
      const amount = parseFloat(invoice.amount) || 0;
      const tax1Amount = parseFloat(invoice.tax_one_amount) || 0;
      const tax2Amount = parseFloat(invoice.tax_two_amount) || 0;
      const commissionAmount = parseFloat(invoice.commission_amount) || 0;

      subTotal += amount;
      tax1Total += tax1Amount;
      tax2Total += tax2Amount;
      totalDue = subTotal + tax1Total + tax2Total;
      commissionTotal += commissionAmount;

      const houseHoldPrecentage = parseFloat(invoice.house_percentage || '0');
      const producer1Precentage = parseFloat(
        invoice.producer_one_percentage || '0',
      );
      const producer2Precentage = parseFloat(
        invoice.producer_two_percentage || '0',
      );
      const producer3Precentage = parseFloat(
        invoice.producer_three_percentage || '0',
      );
      const branchPrecentage = parseFloat(invoice.branch_percentage || '0');

      invoice.house_amount = (
        (commissionAmount * houseHoldPrecentage) /
        100
      ).toString();
      invoice.producer_one_amount = (
        (commissionAmount * producer1Precentage) /
        100
      ).toString();
      invoice.producer_two_amount = (
        (commissionAmount * producer2Precentage) /
        100
      ).toString();
      invoice.producer_three_amount = (
        (commissionAmount * producer3Precentage) /
        100
      ).toString();
      invoice.branch_amount = (
        (commissionAmount * branchPrecentage) /
        100
      ).toString();
    }
  });

  netPayableTotal = subTotal - commissionTotal;
  totalDue += financefees;
  amountDue = totalDue - amountPaid;

  data.sub_total_dollar = subTotal.toString();
  data.net_payable_dollar = netPayableTotal.toString();
  data.tax_one_total = tax1Total.toString();
  data.tax_two_total = tax2Total.toString();
  data.commission_total = commissionTotal.toString();
  data.amount_due = amountDue.toString();
  data.total_due_dollar = totalDue.toString();
};

exports.calculateFinalTotals = (data) => {
  let subTotal = 0;
  let totalTaxAmount = 0;

  // Iterate over bill_details to calculate subTotal and totalTaxAmount
  for (let item of data.bill_details) {
    subTotal += parseFloat(item.amount) || 0;
    totalTaxAmount += parseFloat(item.tax_amount) || 0;
  }

  // Calculate totals step by step
  const totalAfterTax = subTotal + totalTaxAmount;
  const totalAfterDiscount =
    totalAfterTax - (parseFloat(data.discount_amount) || 0);
  const totalAfterAdjustment =
    totalAfterDiscount - (parseFloat(data.adjustment_amount) || 0);

  // Set calculated amounts back to the data object
  data.sub_total_amount = subTotal.toString();
  data.total_tax_amount = totalTaxAmount.toString();
  data.total_due_amount = totalAfterAdjustment.toString();
  data.amount_due = (
    totalAfterAdjustment - parseFloat(data.amount_paid || '0')
  ).toString();
};

exports.getValuesForTransactionReport = (type, sub_type, data) => {
  let { vendor = [] } = data;
  let table_name = null,
    amountField = null,
    primaryKey = null,
    orderByOn = null;

  if (type === 'AR') {
    // && sub_type===""){
    table_name = 'latest_accn_invoice_payment_transaction_items';
    // amountField = 'payment_paid';
    amountField = 'actual_amount_due';
    primaryKey = 'accn_invoice_payment_transaction_items_id';
    // orderByOn = 'invoice_id';
    orderByOn = 'invoice_number';
  } else if (type === 'AP') {
    // && sub_type===""){
    table_name = 'latest_accn_bill_transaction_items';
    amountField = 'final_amount';
    primaryKey = 'accn_bill_transaction_items_id';
    orderByOn = vendor.length ? 'bill_id' : 'vendor';
  } else if (type === 'GL')
    table_name = 'latest_accn_invoice_transaction_items';
  amountField = 'amount'; // Define the field for general ledger reports (adjust as necessary)
  primaryKey = 'accn_invoice_transaction_items_id'; // Primary key for the invoice transaction items table
  orderByOn = vendor.length ? 'invoice_number' : 'vendor';

  return { table_name, amountField, primaryKey, orderByOn };
};

exports.getColumnAndFilterConditionForGl = (payload) => {
  let {
    fields_to_exports = [],
    sub_type = null,
    filter = null,
    order_by,
    general_ledger_report = null,
  } = payload;

  let columnList = [],
    filterCondition = '';

  if (!general_ledger_report)
    throwError(404, 'General Ledger Report is required');

  if (
    sub_type === 'insurer' &&
    general_ledger_report === 'agency_bill_trust_payable_code'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `lappd.insurer_code`,
      `lappd.name`,
      `policy_transaction_type`,
      `branch_code`,
      `agency_or_direct_bill`,
      `lic.name insurer_name`,
      `net_payable_insurer as credit`,
      `0 as debit`,
      `lic.agency_bill_trust_payable_g_or_l_code`,
    ];
    filterCondition = `lappd LEFT JOIN latest_insurer_code lic ON lappd.insurer_code = lic.insurer_code ${filter} AND agency_or_direct_bill = 'A'`;
  } else if (
    sub_type === 'insurer' &&
    general_ledger_report === 'agency_bill_revenue_code'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `lappd.insurer_code`,
      `lappd.name`,
      `policy_transaction_type`,
      `branch_code`,
      `agency_or_direct_bill`,
      `lic.name insurer_name`,
      `commission_amount as credit`,
      `0 as debit`,
      `lic.agency_bill_revenue_g_or_l_code`,
    ];
    filterCondition = `lappd LEFT JOIN latest_insurer_code lic ON lappd.insurer_code = lic.insurer_code ${filter} AND agency_or_direct_bill = 'A'`;
  } else if (
    sub_type === 'insurer' &&
    general_ledger_report === 'direct_bill_trust_payable_code'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `lappd.insurer_code`,
      `lappd.name`,
      `policy_transaction_type`,
      `branch_code`,
      `agency_or_direct_bill`,
      `lic.name insurer_name`,
      `commission_amount as credit`,
      `0 as debit`,
      `lic.direct_bill_revenue_g_or_l_code`,
    ];
    filterCondition = `lappd LEFT JOIN latest_insurer_code lic ON lappd.insurer_code = lic.insurer_code  ${filter} AND agency_or_direct_bill = 'D'`;
  } else if (
    sub_type === 'insurer' &&
    general_ledger_report === 'direct_bill_receivable_code'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `lappd.insurer_code`,
      `lappd.name`,
      `policy_transaction_type`,
      `branch_code`,
      `agency_or_direct_bill`,
      `lic.name insurer_name`,
      `commission_amount as credit`,
      `0 as debit`,
      `lic.direct_bill_receivable_g_or_l_code`,
    ];
    filterCondition = `lappd LEFT JOIN latest_insurer_code lic ON lappd.insurer_code = lic.insurer_code  ${filter} AND agency_or_direct_bill = 'D'`;
  } else if (
    sub_type === 'producer' &&
    (general_ledger_report === 'commission_liability_code' ||
      general_ledger_report === 'commission_expense_code')
  ) {
    if (general_ledger_report === 'commission_liability_code') {
      // columnList = [
      //   `invoice_date`, `invoice_number`, `lappd.insurer_code`, `lappd.name`,`policy_transaction_type`, `lappd.branch_code`, `agency_or_direct_bill`,
      //   `producer_one_amount as credit`, `0 as debit`, `lu.commission_liability_code`, `lappd.producer_one_code producer_code`, `CONCAT(lu.first_name, ' ', lu.last_name) as producer_name`
      // ];
      filterCondition = `SELECT * FROM (SELECT invoice_date, invoice_number, lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, producer_one_amount as credit, 0 as debit, lu.commission_liability_code, lappd.producer_one_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name
      FROM latest_accn_invoice_transaction_items lappd LEFT JOIN latest_user lu ON lappd.producer_one_id = lu.user_fact_id and lappd.invoice_for='Customer' UNION
      SELECT invoice_date, invoice_number, lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, producer_two_amount as credit, 0 as debit, 
      lu.commission_liability_code, lappd.producer_two_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name FROM latest_accn_invoice_transaction_items lappd
      LEFT JOIN latest_user lu ON lappd.producer_two_id = lu.user_fact_id and lappd.invoice_for='Customer' UNION
      SELECT invoice_date, invoice_number, lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, producer_three_amount as credit, 0 as debit, 
      lu.commission_liability_code, lappd.producer_three_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name FROM latest_accn_invoice_transaction_items lappd
      LEFT JOIN latest_user lu ON lappd.producer_three_id = lu.user_fact_id and lappd.invoice_for='Customer') sub_query ${filter} ORDER BY ${order_by}`;
    } else {
      // columnList = [
      //   `invoice_date`, `invoice_number`, `lappd.insurer_code`, `lappd.name`, `policy_transaction_type`, `lappd.branch_code`, `agency_or_direct_bill`,
      //   `0 as credit`, `producer_one_amount as debit`, `lu.commission_expense_code`, `lappd.producer_one_code producer_code`, `CONCAT(lu.first_name, ' ', lu.last_name) as producer_name`
      // ];
      filterCondition = `SELECT * FROM (SELECT invoice_date, invoice_number, lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, 0 as credit, producer_one_amount as debit, lu.commission_expense_code, lappd.producer_one_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name
      FROM latest_accn_invoice_transaction_items lappd LEFT JOIN latest_user lu ON lappd.producer_one_id = lu.user_fact_id and lappd.invoice_for='Customer' UNION
      SELECT invoice_date, invoice_number, lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, 0 as credit, producer_two_amount as debit,
      lu.commission_expense_code, lappd.producer_two_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name FROM latest_accn_invoice_transaction_items lappd
      LEFT JOIN latest_user lu ON lappd.producer_two_id = lu.user_fact_id and lappd.invoice_for='Customer' UNION
      SELECT  invoice_date, invoice_number,lappd.insurer_code, lappd.name, policy_transaction_type, lappd.branch_code, agency_or_direct_bill, 0 as credit, producer_three_amount as debit, 
      lu.commission_expense_code, lappd.producer_three_code producer_code, CONCAT(lu.first_name, ' ', lu.last_name) as producer_name FROM latest_accn_invoice_transaction_items lappd
      LEFT JOIN latest_user lu ON lappd.producer_three_id = lu.user_fact_id and lappd.invoice_for='Customer') sub_query ${filter} ORDER BY ${order_by}`;
    }
  } else if (
    sub_type === 'branch' &&
    general_ledger_report === 'sales_commission_account'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `lappd.insurer_code`,
      `lappd.name`,
      `policy_transaction_type`,
      `lappd.branch_code`,
      `agency_or_direct_bill`,
      `branch_amount as credit`,
      `0 as debit`,
      `lappd.producer_one_code`,
      `lappd.producer_two_code`,
      `lappd.producer_three_code`,
    ];
    filterCondition = `lappd ${filter} AND lappd.invoice_for='Customer' ORDER BY ${order_by} `;
  } else if (
    sub_type === 'customer' &&
    general_ledger_report === 'customer_receivable'
  ) {
    columnList = [
      `invoice_date`,
      `invoice_number`,
      `insurer_code`,
      `name`,
      `policy_transaction_type`,
      `branch_code`,
      `agency_or_direct_bill`,
      `0 as credit`,
      `producer_three_amount as debit`,
      `producer_three_code`,
    ];
    filterCondition = `${filter}`;
  } else throwError(404, 'Invalid general_ledger_report!');
  // if(fields_to_exports.length)
  //   columnList = [fields_to_exports.toString(), "credit", "debit"];

  return { columnList, filterCondition };
};

exports.getColumnAndFilterConditionForArORAp = (payload) => {
  let {
    fields_to_exports = [],
    amountField = null,
    orderByOn = null,
    primaryKey = null,
    filter = null,
  } = payload;

  // fields_to_exports.push("zero_to_thirty_days","thirty_one_to_sixty_days","sixty_one_to_ninety_days","over_ninety_days","balance")

  let columnList = [
    `${fields_to_exports.length ? fields_to_exports.toString() : 't.*'}`,
    `CASE 
        WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 0 AND 30 THEN t.${amountField} 
        ELSE 0 
    END AS 'zero_to_thirty_days'`,
    `CASE 
        WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 31 AND 60 THEN t.${amountField} 
        ELSE 0 
    END AS 'thirty_one_to_sixty_days'`,
    `CASE 
        WHEN DATEDIFF(NOW(), t.insert_ts) BETWEEN 61 AND 90 THEN t.${amountField} 
        ELSE 0 
    END AS 'sixty_one_to_ninety_days'`,
    `CASE 
        WHEN DATEDIFF(NOW(), t.insert_ts) > 90 THEN t.${amountField} 
        ELSE 0 
    END AS 'over_ninety_days'`,
    `SUM(t.${amountField}) OVER (PARTITION BY t.${orderByOn} ORDER BY t.${primaryKey}) AS balance`,
  ];

  let filterCondition =
    `t ` + filter + ` ORDER BY t.${orderByOn}, t.${primaryKey}`;

  return { columnList, filterCondition };
};
