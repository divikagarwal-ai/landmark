-- Active: 1705402163735@@159.203.15.232@3306@testgb_4Feb
DROP VIEW IF EXISTS latest_accn_transactions;
CREATE VIEW latest_accn_transactions
AS
SELECT pcdc.*
FROM accn_transactions AS pcdc
JOIN (
  SELECT MAX(accn_transactions_id) AS max_id, customer_policy_id, incremental_number
  FROM accn_transactions
  GROUP BY customer_policy_id, incremental_number
) AS subquery ON pcdc.accn_transactions_id = subquery.max_id;