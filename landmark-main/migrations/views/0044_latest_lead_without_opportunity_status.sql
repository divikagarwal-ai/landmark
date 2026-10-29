
DROP VIEW IF EXISTS latest_lead_without_opportunity_status;
CREATE OR REPLACE VIEW latest_lead_without_opportunity_status AS
SELECT
	ft.*
FROM
	`leads` ft
	LEFT JOIN `leads` rt 
	ON 
		ft.leads_unique_id = rt.leads_unique_id AND
         ft.leads_id < rt.leads_id
WHERE
	rt.leads_id IS NULL
	AND
	ft.`status` <> "OPPORTUNITY";
	