DROP VIEW IF EXISTS latest_review_keywords;
CREATE VIEW latest_review_keywords AS
SELECT ft.*
FROM review_keywords AS ft
LEFT JOIN review_keywords AS rt
  ON  ft.review_id = rt.review_id
  AND ft.review_keywords_id < rt.review_keywords_id
WHERE rt.review_keywords_id IS NULL;