DROP VIEW IF EXISTS latest_google_reviews;

CREATE VIEW latest_google_reviews AS
SELECT ft.*
FROM google_reviews AS ft
LEFT JOIN google_reviews AS rt
  ON ft.google_reviews_unique_id = rt.google_reviews_unique_id
  AND ft.google_reviews_id < rt.google_reviews_id
WHERE rt.google_reviews_id IS NULL;
