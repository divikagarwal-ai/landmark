create or replace view latest_review as
select ft.*
from review ft
    INNER join (
        select
            max(review_id) as review_id, review_unique_id
        from review
        group by
            review_unique_id
    ) sc on ft.review_id = sc.review_id;