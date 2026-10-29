DROP VIEW IF EXISTS latest_response_style;
CREATE VIEW latest_response_style AS
SELECT ft.*
FROM response_style AS ft
LEFT JOIN response_style AS rt
  ON ft.response_style_unique_id = rt.response_style_unique_id
  AND ft.response_style_id < rt.response_style_id
WHERE rt.response_style_id IS NULL;