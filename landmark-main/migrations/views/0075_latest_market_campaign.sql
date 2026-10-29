DROP VIEW IF EXISTS latest_market_campaign;
CREATE VIEW latest_market_campaign AS
SELECT ft.*
FROM market_campaign AS ft
LEFT JOIN market_campaign AS rt
  ON ft.market_campaign_unique_id = rt.market_campaign_unique_id
  AND ft.market_campaign_id < rt.market_campaign_id
WHERE rt.market_campaign_id IS NULL;