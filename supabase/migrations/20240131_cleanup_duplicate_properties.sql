-- Create a temporary table to store the properties we want to keep
create temporary table temp_properties as
select distinct on (diagram_id, name) id, diagram_id, name, value, position
from diagram_properties
order by diagram_id, name, position;

-- Delete all properties that aren't in our temp table
delete from diagram_properties
where id not in (select id from temp_properties);

-- Update positions to be sequential for each diagram
with numbered_properties as (
  select id,
         row_number() over (partition by diagram_id order by position) - 1 as new_position
  from diagram_properties
)
update diagram_properties
set position = numbered_properties.new_position
from numbered_properties
where diagram_properties.id = numbered_properties.id;

-- Now we can safely add the unique constraint
alter table diagram_properties
add constraint unique_diagram_property_name unique (diagram_id, name);
