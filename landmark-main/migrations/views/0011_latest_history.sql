Create or REPLACE view latest_history as
select
    h.*,
    CONCAT(
        lu.first_name,
        " ",
        lu.last_name
    ) as "name"
from history h
    left join latest_user lu on h.created_by_uuid = lu.user_uuid;

