DROP VIEW IF EXISTS latest_customer_social;
CREATE VIEW latest_customer_social AS
SELECT ft.*
FROM customer_social AS ft
LEFT JOIN customer_social AS rt
  ON ft.  customer_social_unique_id = rt. customer_social_unique_id
  AND ft.customer_social_id < rt.customer_social_id
left join latest_customer_prospect_details lcpd 
on lcpd.customer_fact_uuid = ft.customer_fact_uuid
WHERE rt.customer_social_id IS NULL;