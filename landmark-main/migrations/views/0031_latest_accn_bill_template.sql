-- Active: 1691394706277@@159.203.15.232@3306@testgb
DROP VIEW IF EXISTS latest_accn_bill_template;
CREATE VIEW latest_accn_bill_template
AS
SELECT acca.*
FROM accn_bill_template AS acca
JOIN (
  SELECT MAX(accn_bill_template_id) AS max_id, accn_bill_template_code, incremental_number
  FROM accn_bill_template
  GROUP BY accn_bill_template_code, incremental_number
) AS subquery ON acca.accn_bill_template_id = subquery.max_id;