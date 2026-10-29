DROP VIEW IF EXISTS latest_accn_company_information;
CREATE VIEW latest_accn_company_information
AS
SELECT pcdc.*
FROM accn_company_information AS pcdc
JOIN (
  SELECT MAX(accn_company_information_id) AS max_id, company_id
  FROM accn_company_information
  GROUP BY company_id
) AS subquery ON pcdc.accn_company_information_id = subquery.max_id;