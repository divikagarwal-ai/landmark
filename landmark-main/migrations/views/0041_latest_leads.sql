DROP VIEW IF EXISTS latest_leads;
CREATE VIEW latest_leads
AS
SELECT ft.*
FROM `leads` AS ft
LEFT JOIN `leads` AS rt 
  ON ft.leads_unique_id = rt.leads_unique_id 
  AND ft.leads_id < rt.leads_id
WHERE rt.leads_id IS NULL and ft.status <> 'INACTIVE';
