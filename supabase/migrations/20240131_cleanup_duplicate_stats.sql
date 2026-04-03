-- Create a temporary table to store the stats we want to keep
create temporary table temp_stats as
select distinct
  on (diagram_id, name) id,
  diagram_id,
  name,
  value,
  position
from
  diagram_stats
order by
  diagram_id,
  name,
  position;

-- Delete all stats that aren't in our temp table
delete from diagram_stats
where
  id not in (
    select
      id
    from
      temp_stats
  );

-- Update positions to be sequential for each diagram
with
  numbered_stats as (
    select
      id,
      row_number() over (
        partition by
          diagram_id
        order by
          position
      ) - 1 as new_position
    from
      diagram_stats
  )
update diagram_stats
set
  position = numbered_stats.new_position
from
  numbered_stats
where
  diagram_stats.id = numbered_stats.id;

-- Now we can safely add the unique constraint
alter table diagram_stats add constraint unique_diagram_stat_name unique (diagram_id, name);