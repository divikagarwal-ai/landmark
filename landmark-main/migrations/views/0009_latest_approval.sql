create or replace view latest_approval as
select ft.*
from approval ft
    join (
        select max(approval_id) approval_id
        from approval
        GROUP BY
            table_name, record_uuid
    ) sub on ft.approval_id = sub.approval_id;