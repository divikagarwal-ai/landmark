DROP VIEW IF EXISTS latest_accn_invoice_information;
CREATE VIEW latest_accn_invoice_information
AS
SELECT 
  pcdc.*,
  rt.payment_paid as payment_paid
FROM accn_invoice_information AS pcdc
JOIN (
  SELECT MAX(accn_invoice_information_id) AS max_id, invoice_number
  FROM accn_invoice_information
  GROUP BY invoice_number
) AS subquery ON pcdc.accn_invoice_information_id = subquery.max_id
LEFT JOIN 
(SELECT SUM(payment_paid) payment_paid, invoice_number FROM latest_accn_invoice_payment_transaction_items GROUP BY invoice_number) rt
ON pcdc.invoice_number=rt.invoice_number
ORDER BY insert_ts DESC;