/*
# Create profiles table for LearnLoop user accounts

## Purpose
Stores each user's display name alongside their Supabase auth account.
The auth identity (email, password, session) lives in Supabase's built-in
auth.users table — this table only holds the friendly name shown in the UI.

## New Tables
- `profiles`
  - `id` (uuid, primary key) — matches the user's auth uid via FK
  - `full_name` (text, not null) — the display name entered at sign-up
  - `created_at` (timestamptz) — when the profile was created

## Security
- Row Level Security enabled on `profiles`
- Grant SELECT, INSERT, UPDATE to `authenticated` only (app requires sign-in)
- Four owner-scoped policies (select/insert/update/delete) using auth.uid()
- Foreign key to auth.users with CASCADE delete so profiles disappear when auth users are deleted
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);
