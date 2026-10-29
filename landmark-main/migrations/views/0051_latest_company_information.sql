DROP VIEW IF EXISTS latest_company_information;

CREATE VIEW latest_company_information AS
SELECT ft.*
FROM company_information AS ft
LEFT JOIN company_information AS rt
  ON ft.company_information_unique_id = rt.company_information_unique_id
  AND ft.company_information_id < rt.company_information_id
WHERE rt.company_information_id IS NULL;
