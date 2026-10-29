DROP VIEW IF EXISTS latest_transaction;

CREATE VIEW latest_transaction AS
SELECT ft.*
FROM transaction AS ft
LEFT JOIN transaction AS rt
  ON ft.transaction_unique_id = rt.transaction_unique_id
  AND ft.transaction_id < rt.transaction_id
WHERE rt.transaction_id IS NULL;
