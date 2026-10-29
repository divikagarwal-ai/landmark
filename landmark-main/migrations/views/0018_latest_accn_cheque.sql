DROP VIEW IF EXISTS latest_accn_cheque;
CREATE VIEW latest_accn_cheque
AS
SELECT pcdc.*
FROM accn_cheque AS pcdc
JOIN (
  SELECT MAX(accn_cheque_id) AS max_id, payment_id
  FROM accn_cheque
  GROUP BY payment_id
) AS subquery ON pcdc.accn_cheque_id = subquery.max_id;