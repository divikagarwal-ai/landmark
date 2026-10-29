DROP VIEW IF EXISTS latest_calendar;

CREATE VIEW latest_calendar AS
SELECT ft.*
FROM calendar AS ft
LEFT JOIN calendar AS rt
  ON ft.calendar_unique_id = rt.calendar_unique_id
  AND ft.calendar_id < rt.calendar_id
WHERE rt.calendar_id IS NULL;
