-- Add position column to tier_lists table if it doesn't exist
ALTER TABLE tier_lists ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Create group_tier_lists table if it doesn't exist
CREATE TABLE IF NOT EXISTS group_tier_lists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  tier_list_id uuid REFERENCES tier_lists(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, tier_list_id)
);

-- Add RLS policies for group_tier_lists
ALTER TABLE group_tier_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own group tier lists" ON group_tier_lists
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own group tier lists" ON group_tier_lists
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own group tier lists" ON group_tier_lists
  FOR UPDATE USING (
    group_id IN (
      SELECT id FROM groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own group tier lists" ON group_tier_lists
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM groups WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_tier_lists_group_id ON group_tier_lists(group_id);
CREATE INDEX IF NOT EXISTS idx_group_tier_lists_tier_list_id ON group_tier_lists(tier_list_id);
CREATE INDEX IF NOT EXISTS idx_group_tier_lists_position ON group_tier_lists(position);
