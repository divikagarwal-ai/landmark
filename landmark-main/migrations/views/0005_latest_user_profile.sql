create or replace view latest_user_profile as
select ft.*
from user_profile ft
    INNER join (
        select
            max(user_profile_id) as user_profile_id,
            user_profile_unique_id
        from user_profile
        group by user_profile_unique_id
    ) sc on ft.user_profile_id = sc.user_profile_id;