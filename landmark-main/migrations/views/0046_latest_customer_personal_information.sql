DROP VIEW IF EXISTS latest_customer_personal_information;
CREATE VIEW latest_customer_personal_information AS
SELECT 
    ft.*
FROM customer_personal_information AS ft
LEFT JOIN customer_personal_information AS rt 
  ON ft. customer_personal_information_unique_id = rt. customer_personal_information_unique_id
  AND ft.customer_personal_information_id < rt.customer_personal_information_id;
