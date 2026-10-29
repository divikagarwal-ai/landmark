CREATE or REPLACE VIEW latest_branch AS
select ft.*
from branch ft
    INNER join (
        select
            max(branch_id) as branch_id,
            branch_unique_id
        from branch
        group by
            branch_unique_id
    ) sub on ft.branch_id = sub.branch_id
order by ft.branch_id desc;