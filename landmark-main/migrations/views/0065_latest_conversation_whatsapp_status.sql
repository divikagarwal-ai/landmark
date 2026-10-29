DROP VIEW IF EXISTS latest_conversation_whatsapp_status;

CREATE VIEW latest_conversation_whatsapp_status AS
SELECT ft.*
FROM conversation_whatsapp_status AS ft
LEFT JOIN conversation_whatsapp_status AS rt
  ON ft.conversation_id = rt.conversation_id
  AND ft.conversation_whatsapp_status_id < rt.conversation_whatsapp_status_id
WHERE rt.conversation_whatsapp_status_id IS NULL;
