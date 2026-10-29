DROP VIEW IF EXISTS latest_accn_payment_payable_details;
CREATE VIEW latest_accn_payment_payable_details
AS
SELECT 
  pav.*,
  labti.customer_id,
  labti.detail,
  labti.account,
  labti.description,
  labti.tax_percentage,
  labti.tax_amount,
  labti.amount,
  labti.final_amount,
  labti.vendor,
  labti.category,
  labti.bill_date,
  labti.bill_id,
  labti.bill_type,
  labti.due_date,
  labti.payment_terms
  -- labti.total_due_amount
FROM accn_payment_payable_details AS pav
JOIN (
  SELECT MAX(accn_payment_payable_details_id) AS max_id, payment_id, accn_transaction_id
  FROM accn_payment_payable_details
  GROUP BY payment_id, accn_transaction_id
) AS subquery ON pav.accn_payment_payable_details_id = subquery.max_id
LEFT JOIN latest_accn_bill_transaction_items labti
ON pav.bill_number = labti.`bill_id`;