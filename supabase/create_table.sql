-- ============================================================
-- Supabase Table: form_submissions
-- Run this ENTIRE script in Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → Paste & Run
-- ============================================================

-- Clean slate: drop existing table and all its policies
DROP TABLE IF EXISTS form_submissions CASCADE;

-- Create the table
CREATE TABLE form_submissions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Q1: What country or region are you in? (dropdown)
  country               TEXT,

  -- Q2: How long have you been trading? (multiple_choice)
  trading_duration      TEXT,

  -- Q3: What keeps you from being profitable? (multiple_choice)
  profitability_reason  TEXT,

  -- Q4: Which best describes your current situation? (multiple_choice)
  trading_situation     TEXT,

  -- Q5: Are you currently profitable? (multiple_choice)
  currently_profitable  TEXT,

  -- Q6: Why are you looking for private 1:1 mentorship? (long_text)
  mentorship_reason     TEXT,

  -- Q7: Willing to follow a step-by-step process? (multiple_choice)
  willing_to_follow_process TEXT,

  -- Q8: Ready to invest in your future? (multiple_choice)
  investment_ready      TEXT,

  -- Q9: Contact Details (contact_group)
  first_name            TEXT,
  last_name             TEXT,
  email                 TEXT,
  phone                 TEXT,
  best_time_to_reach    TEXT
);

-- ============================================================
-- Row Level Security (RLS)
-- Supabase API ALWAYS enforces RLS, so we must enable it
-- and create explicit policies for the anon role.
-- ============================================================

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Grant table-level permissions to Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON form_submissions TO anon;
GRANT SELECT ON form_submissions TO authenticated;
GRANT ALL ON form_submissions TO authenticated;

-- Policy: Allow anonymous inserts (public form, anyone can submit)
CREATE POLICY "allow_anon_insert"
  ON form_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all submissions
CREATE POLICY "allow_authenticated_select"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Index on created_at for sorting submissions
CREATE INDEX idx_form_submissions_created_at ON form_submissions (created_at DESC);
