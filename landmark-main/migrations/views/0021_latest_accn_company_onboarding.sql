DROP VIEW IF EXISTS latest_accn_company_onboarding;
CREATE VIEW latest_accn_company_onboarding
AS
SELECT pcdc.*
FROM accn_company_onboarding AS pcdc
JOIN (
  SELECT MAX(accn_company_onboarding_id) AS max_id, company_id
  FROM accn_company_onboarding
  GROUP BY company_id
) AS subquery ON pcdc.accn_company_onboarding_id = subquery.max_id;