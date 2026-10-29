DROP VIEW IF EXISTS latest_food_menu;

CREATE VIEW latest_food_menu AS
SELECT ft.*
FROM food_menu AS ft
LEFT JOIN food_menu AS rt
  ON ft.food_menu_unique_id = rt.food_menu_unique_id
  AND ft.food_menu_id < rt.food_menu_id
WHERE rt.food_menu_id IS NULL;
