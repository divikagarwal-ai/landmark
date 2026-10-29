create or replace view latest_approval_count as 
select ft.*
from approval_count ft
    inner join (
        select max(approval_count_id) approval_count_id,approval_count_unique_id
        from approval_count
        GROUP BY
            approval_count_unique_id
    ) sub on ft.approval_count_id = sub.approval_count_id;