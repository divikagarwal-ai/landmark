DROP VIEW IF EXISTS latest_templates;
CREATE VIEW latest_templates
AS
SELECT temp.*
FROM templates AS temp
JOIN (
  SELECT MAX(templates_id) AS max_id, template_code
  FROM templates
  GROUP BY template_code
) AS subquery ON temp.templates_id = subquery.max_id;