create or replace view latest_comment_t as
select ft.*
from comment_t ft
    INNER join (
        select
            max(comment_t_id) as comment_t_id,
            comment_t_unique_id
        from comment_t
        group by comment_t_unique_id
    ) sc on ft.comment_t_id = sc.comment_t_id;