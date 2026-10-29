DROP VIEW IF EXISTS latest_email_history;

CREATE VIEW latest_email_history AS
SELECT ft.*
FROM email_history AS ft
LEFT JOIN email_history AS rt
  ON ft.email_history_unique_id = rt.email_history_unique_id
  AND ft.email_history_id < rt.email_history_id
WHERE rt.email_history_id IS NULL;
