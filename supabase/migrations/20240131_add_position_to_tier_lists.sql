-- Add position column to tier_lists table
ALTER TABLE tier_lists ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Update existing records to have sequential positions
WITH numbered_tier_lists AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as new_position
  FROM tier_lists
)
UPDATE tier_lists
SET position = numbered_tier_lists.new_position
FROM numbered_tier_lists
WHERE tier_lists.id = numbered_tier_lists.id;
