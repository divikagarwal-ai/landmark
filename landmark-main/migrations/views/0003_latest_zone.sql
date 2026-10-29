create or replace view latest_zone as
select ft.*
from zone ft
    INNER join (
        select
            max(zone_id) as zone_id,
            zone_unique_id
        from zone
        group by zone_unique_id
    ) sc on ft.zone_id = sc.zone_id;