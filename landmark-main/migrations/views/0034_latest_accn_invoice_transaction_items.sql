DROP VIEW IF EXISTS latest_accn_invoice_transaction_items;
CREATE VIEW latest_accn_invoice_transaction_items
AS
SELECT 
  pav.*
FROM accn_invoice_transaction_items AS pav
JOIN (
  SELECT MAX(accn_invoice_transaction_items_id) AS max_id, invoice_number, accn_transaction_id
  FROM accn_invoice_transaction_items
  GROUP BY invoice_number, accn_transaction_id
) AS subquery ON pav.accn_invoice_transaction_items_id = subquery.max_id;