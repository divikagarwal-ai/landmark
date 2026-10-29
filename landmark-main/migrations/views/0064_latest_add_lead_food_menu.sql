DROP VIEW IF EXISTS latest_added_lead_food_menu;

CREATE VIEW latest_added_lead_food_menu AS
SELECT ft.*
FROM added_lead_food_menu AS ft
LEFT JOIN added_lead_food_menu AS rt
  ON ft.added_lead_food_menu_unique_id = rt.added_lead_food_menu_unique_id
  AND ft.added_lead_food_menu_id < rt.added_lead_food_menu_id
WHERE rt.added_lead_food_menu_id IS NULL;
