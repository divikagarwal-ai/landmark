DROP VIEW IF EXISTS latest_accn_create_bill;
CREATE VIEW latest_accn_create_bill
AS
SELECT 
  pcdc.*,
  rt.payment_paid as payment_paid
  -- (total_due_amount-rt.payment_paid) remaining_amount_due
FROM accn_create_bill AS pcdc
JOIN (
  SELECT MAX(accn_create_bill_id) AS max_id, bill_id
  FROM accn_create_bill
  GROUP BY bill_id
) AS subquery ON pcdc.accn_create_bill_id = subquery.max_id
LEFT JOIN 
(SELECT SUM(payment_paid) payment_paid, bill_id FROM latest_accn_payment_payable_details GROUP BY bill_id) rt
ON pcdc.bill_id=rt.bill_id
ORDER BY insert_ts DESC;