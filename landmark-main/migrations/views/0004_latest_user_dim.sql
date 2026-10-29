create or replace view latest_user_dim as
select ft.*
from user_dim ft
    INNER join (
        select
            max(user_dim_id) as user_dim_id,
            user_dim_unique_id
        from user_dim
        group by user_dim_unique_id
    ) sc on ft.user_dim_id = sc.user_dim_id;