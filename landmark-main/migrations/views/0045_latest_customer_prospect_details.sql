DROP VIEW IF EXISTS latest_customer_prospect_details;
CREATE VIEW latest_customer_prospect_details AS
SELECT ft.*
FROM customer_prospect_details AS ft
LEFT JOIN customer_prospect_details AS rt
  ON ft.  customer_prospect_details_unique_id = rt. customer_prospect_details_unique_id
  AND ft.customer_prospect_details_id < rt.customer_prospect_details_id
WHERE rt.customer_prospect_details_id IS NULL;
