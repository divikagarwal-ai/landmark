DROP VIEW IF EXISTS latest_review_analysis;

CREATE VIEW latest_review_analysis AS
SELECT ft.*
FROM review_analysis AS ft
LEFT JOIN review_analysis AS rt
  ON ft.review_analysis_unique_id = rt.review_analysis_unique_id
  AND ft.review_analysis_id < rt.review_analysis_id
WHERE rt.review_analysis_id IS NULL;
