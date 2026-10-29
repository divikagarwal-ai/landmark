create or replace view latest_role as
select ft.*
from `role` ft
    INNER join (
        select
            max(role_id) as role_id,
            role_unique_id
        from `role`
        group by role_unique_id
    ) sc on ft.role_id = sc.role_id;