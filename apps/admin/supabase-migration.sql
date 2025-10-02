-- Create the scenario_table for Supabase
-- This table stores UI scenarios/screens for the render engine

CREATE TABLE IF NOT EXISTS scenario_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  key TEXT NOT NULL UNIQUE,
  "mainComponent" JSONB NOT NULL,
  components JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  build_number INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create an index on the key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_scenario_table_key ON scenario_table(key);

-- Create an index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_scenario_table_updated_at ON scenario_table(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE scenario_table ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all scenarios
CREATE POLICY "Allow authenticated users to read scenarios" ON scenario_table
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert scenarios
CREATE POLICY "Allow authenticated users to insert scenarios" ON scenario_table
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update scenarios
CREATE POLICY "Allow authenticated users to update scenarios" ON scenario_table
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete scenarios
CREATE POLICY "Allow authenticated users to delete scenarios" ON scenario_table
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scenario_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before updates
CREATE TRIGGER set_scenario_updated_at
  BEFORE UPDATE ON scenario_table
  FOR EACH ROW
  EXECUTE FUNCTION update_scenario_updated_at();

-- Insert sample data (optional - remove if not needed)
INSERT INTO scenario_table (key, "mainComponent", components, version, build_number, metadata)
VALUES
  ('main-feed', '{"type": "FeedScreen"}'::jsonb, '[]'::jsonb, '2.1.0', 15, '{}'::jsonb),
  ('profile-view', '{"type": "ProfileScreen"}'::jsonb, '[]'::jsonb, '1.8.3', 8, '{}'::jsonb),
  ('search-results', '{"type": "SearchScreen"}'::jsonb, '[]'::jsonb, '1.5.0', 5, '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

