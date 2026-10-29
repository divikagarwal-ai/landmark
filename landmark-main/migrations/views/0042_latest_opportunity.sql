DROP VIEW IF EXISTS latest_opportunity;

CREATE VIEW latest_opportunity AS
SELECT l.*
FROM opportunity AS l
LEFT JOIN opportunity AS r
  ON l.leads_uuid = r.leads_uuid
  AND l.opportunity_id < r.opportunity_id
WHERE r.opportunity_id IS NULL
ORDER BY l.insert_ts DESC;
