DROP VIEW IF EXISTS latest_accn_create_payment;
CREATE VIEW latest_accn_create_payment
AS
SELECT pcdc.*
FROM accn_create_payment AS pcdc
JOIN (
  SELECT MAX(accn_create_payment_id) AS max_id,  accn_create_payment_id
  FROM accn_create_payment
  GROUP BY  accn_create_payment_id
) AS subquery ON pcdc. accn_create_payment_id= subquery.max_id;