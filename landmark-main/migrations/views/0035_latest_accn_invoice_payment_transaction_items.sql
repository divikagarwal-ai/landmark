DROP VIEW IF EXISTS latest_accn_invoice_payment_transaction_items;
CREATE VIEW latest_accn_invoice_payment_transaction_items
AS
SELECT pav.*,
CASE 
  WHEN (amount_due-payment_paid) <=0 THEN 0
  ELSE amount_due-payment_paid
END actual_amount_due,
-- lati.invoice_due_date,
-- lati.transaction_type,
lati.accn_invoice_transaction_items_uuid,
-- lati.gl_account_code,
lati.amount,
-- lati.invoice_number,
-- lati.payment_terms,
-- lati.customer_name,
-- lati.policy_type,
-- lati.policy_transaction_type,
-- lati.policy_status,
-- lati.transaction_date,
-- lati.effective_date,
-- lati.default_tax_region,
-- lati.agency_or_direct_bill,
-- lati.premium_financed,
-- lati.financed_by,
-- lati.financed_fee,
-- lati.producer_one_id,
-- lati.producer_one_code,
-- lati.producer_two_id,
-- lati.producer_two_code,
-- lati.producer_three_id,
-- lati.producer_three_code,
-- lati.csr_code,
-- lati.branch_code,
-- lati.insurer_code,
lati.tax_one_percentage,
lati.tax_one_amount,
lati.tax_two_percentage,
lati.tax_two_amount,
lati.commission_percentage,
lati.commission_amount,
lati.house_percentage,
lati.house_amount,
lati.producer_one_percentage,
lati.producer_one_amount,
lati.producer_two_percentage,
lati.producer_two_amount,
lati.producer_three_percentage,
lati.producer_three_amount,
lati.branch_percentage,
lati.branch_amount,
lati.total_amount
-- lati.total_due_dollar as invoice_total_due_dollar
FROM accn_invoice_payment_transaction_items AS pav
JOIN (
  SELECT MAX(accn_invoice_payment_transaction_items_id) AS max_id, invoice_number, accn_transaction_id
  FROM accn_invoice_payment_transaction_items
  GROUP BY invoice_number, accn_transaction_id
) AS subquery ON pav.accn_invoice_payment_transaction_items_id = subquery.max_id
LEFT JOIN latest_accn_invoice_transaction_items lati ON pav.invoice_number = lati.invoice_number;