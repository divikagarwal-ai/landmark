DROP VIEW IF EXISTS latest_accn_tax_info;
CREATE VIEW latest_accn_tax_info
AS
SELECT pcdc.*
FROM accn_tax_info AS pcdc
JOIN (
  SELECT MAX(accn_tax_info_id) AS max_id, company_id
  FROM accn_tax_info
  GROUP BY company_id
) AS subquery ON pcdc.accn_tax_info_id = subquery.max_id;