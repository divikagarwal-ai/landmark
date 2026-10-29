DROP VIEW IF EXISTS latest_accn_accounting_information;
CREATE VIEW latest_accn_accounting_information
AS
SELECT pcdc.*
FROM accn_accounting_information AS pcdc
JOIN (
  SELECT MAX(accn_accounting_information_id) AS max_id, accn_accounting_information_id
  FROM accn_accounting_information
  GROUP BY accn_accounting_information_id
) AS subquery ON pcdc.accn_accounting_information_id = subquery.max_id;