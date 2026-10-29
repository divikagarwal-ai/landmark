DROP VIEW IF EXISTS latest_environment_configuration;

CREATE VIEW latest_environment_configuration AS
SELECT ft.*
FROM environment_configuration AS ft
LEFT JOIN environment_configuration AS rt
  ON ft.environment_configuration_unique_id = rt.environment_configuration_unique_id
  AND ft.environment_configuration_id < rt.environment_configuration_id
WHERE rt.environment_configuration_id IS NULL;
