DROP VIEW IF EXISTS latest_accn_vendor;
CREATE VIEW latest_accn_vendor
AS
SELECT pcdc.*
FROM accn_vendor AS pcdc
JOIN (
  SELECT MAX(accn_vendor_id) AS max_id, vendor_code
  FROM accn_vendor
  GROUP BY vendor_code
) AS subquery ON pcdc.accn_vendor_id = subquery.max_id;