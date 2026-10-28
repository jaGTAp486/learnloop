/*
# Create cozy_missions and study_room tables for LearnLoop

## Purpose
Stores Cozy Study Mission sessions and the user's personalized Study Room state.

## New Tables
1. `cozy_missions` — interactive study mission sessions with goals, questions, answers, steps, score, and XP
2. `study_room` — single row per user storing unlocked/equipped decoration items and wall color

## Security
- RLS enabled on both tables, owner-scoped (TO authenticated, auth.uid() = user_id)
- Grants scoped to authenticated only (app requires sign-in)
- cozy_missions stores questions/answers/steps as JSONB since they are complex nested structures
*/

-- 1. cozy_missions
CREATE TABLE IF NOT EXISTS cozy_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  duration int NOT NULL DEFAULT 15,
  goals text[] NOT NULL DEFAULT '{}',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  score int,
  xp_earned int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE cozy_missions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON cozy_missions TO authenticated;
DROP POLICY IF EXISTS "select_own_cozy_missions" ON cozy_missions;
CREATE POLICY "select_own_cozy_missions" ON cozy_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_cozy_missions" ON cozy_missions;
CREATE POLICY "insert_own_cozy_missions" ON cozy_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_cozy_missions" ON cozy_missions;
CREATE POLICY "update_own_cozy_missions" ON cozy_missions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_cozy_missions" ON cozy_missions;
CREATE POLICY "delete_own_cozy_missions" ON cozy_missions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cozy_missions_user ON cozy_missions(user_id);

-- 2. study_room (single row per user)
CREATE TABLE IF NOT EXISTS study_room (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_items text[] NOT NULL DEFAULT '{desk-lamp,laptop}',
  equipped_items text[] NOT NULL DEFAULT '{desk-lamp,laptop}',
  wall_color text NOT NULL DEFAULT 'midnight',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE study_room ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_room TO authenticated;
DROP POLICY IF EXISTS "select_own_study_room" ON study_room;
CREATE POLICY "select_own_study_room" ON study_room FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_study_room" ON study_room;
CREATE POLICY "insert_own_study_room" ON study_room FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_study_room" ON study_room;
CREATE POLICY "update_own_study_room" ON study_room FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_study_room" ON study_room;
CREATE POLICY "delete_own_study_room" ON study_room FOR DELETE TO authenticated USING (auth.uid() = user_id);
