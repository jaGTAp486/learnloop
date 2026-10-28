/*
# Create LearnLoop application data tables

## Purpose
LearnLoop currently stores all user data (study goals, missions, quiz attempts,
mastery tracking, activities, arcade stats, revision queue, notes/doubts history,
circle memberships and posts) in the browser's localStorage. This migration
moves that data to the Supabase database so it persists per-user across devices
and is protected by Row Level Security.

## New Tables
1. `study_goals` — user's personal study goals with done/undone state
2. `missions` — study missions with difficulty and completion status
3. `quiz_attempts` — records of quiz scores per topic
4. `mastery_topics` — aggregated mastery stats per topic (best/avg/last score)
5. `activities` — recent activity feed items (doubt, notes, quiz, etc.)
6. `notes_history` — log of generated notes topics
7. `doubts_history` — log of asked doubt questions
8. `revision_queue` — prioritized weak topics for revision
9. `arcade_stats` — single row per user with XP, games played, achievements, best scores
10. `circle_memberships` — which circles a user has joined
11. `circle_posts` — user posts within learning circles

## Shared patterns
- Every user-owned table has `user_id uuid NOT NULL DEFAULT auth.uid()`
- All tables use RLS with owner-scoped policies (TO authenticated, auth.uid() = user_id)
- Grants are scoped to authenticated only (the app requires sign-in)
- circle_posts and circle_memberships are keyed on circle_id (text) since the
  circles themselves are sample/seed data in the frontend, not a DB table

## Security
- RLS enabled on all tables
- Only authenticated users can access their own rows
- No anon access (app requires sign-in)
*/

-- 1. study_goals
CREATE TABLE IF NOT EXISTS study_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_goals TO authenticated;
DROP POLICY IF EXISTS "select_own_study_goals" ON study_goals;
CREATE POLICY "select_own_study_goals" ON study_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_study_goals" ON study_goals;
CREATE POLICY "insert_own_study_goals" ON study_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_study_goals" ON study_goals;
CREATE POLICY "update_own_study_goals" ON study_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_study_goals" ON study_goals;
CREATE POLICY "delete_own_study_goals" ON study_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. missions
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON missions TO authenticated;
DROP POLICY IF EXISTS "select_own_missions" ON missions;
CREATE POLICY "select_own_missions" ON missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_missions" ON missions;
CREATE POLICY "insert_own_missions" ON missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_missions" ON missions;
CREATE POLICY "update_own_missions" ON missions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_missions" ON missions;
CREATE POLICY "delete_own_missions" ON missions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  total_questions int NOT NULL DEFAULT 0,
  correct_answers int NOT NULL DEFAULT 0,
  score int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_attempts TO authenticated;
DROP POLICY IF EXISTS "select_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "select_own_quiz_attempts" ON quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "insert_own_quiz_attempts" ON quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "update_own_quiz_attempts" ON quiz_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "delete_own_quiz_attempts" ON quiz_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON quiz_attempts(created_at DESC);

-- 4. mastery_topics
CREATE TABLE IF NOT EXISTS mastery_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  best_score int NOT NULL DEFAULT 0,
  last_score int NOT NULL DEFAULT 0,
  avg_score int NOT NULL DEFAULT 0,
  last_practiced_at timestamptz,
  UNIQUE(user_id, topic)
);
ALTER TABLE mastery_topics ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON mastery_topics TO authenticated;
DROP POLICY IF EXISTS "select_own_mastery" ON mastery_topics;
CREATE POLICY "select_own_mastery" ON mastery_topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mastery" ON mastery_topics;
CREATE POLICY "insert_own_mastery" ON mastery_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mastery" ON mastery_topics;
CREATE POLICY "update_own_mastery" ON mastery_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mastery" ON mastery_topics;
CREATE POLICY "delete_own_mastery" ON mastery_topics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mastery_user ON mastery_topics(user_id);

-- 5. activities
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('doubt','notes','quiz','exam','chat','mission','circle','arcade')),
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  timestamp timestamptz DEFAULT now()
);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON activities TO authenticated;
DROP POLICY IF EXISTS "select_own_activities" ON activities;
CREATE POLICY "select_own_activities" ON activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activities" ON activities;
CREATE POLICY "insert_own_activities" ON activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_activities" ON activities;
CREATE POLICY "update_own_activities" ON activities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_activities" ON activities;
CREATE POLICY "delete_own_activities" ON activities FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_ts ON activities(timestamp DESC);

-- 6. notes_history
CREATE TABLE IF NOT EXISTS notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notes_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes_history TO authenticated;
DROP POLICY IF EXISTS "select_own_notes" ON notes_history;
CREATE POLICY "select_own_notes" ON notes_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notes" ON notes_history;
CREATE POLICY "insert_own_notes" ON notes_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notes" ON notes_history;
CREATE POLICY "update_own_notes" ON notes_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notes" ON notes_history;
CREATE POLICY "delete_own_notes" ON notes_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. doubts_history
CREATE TABLE IF NOT EXISTS doubts_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE doubts_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON doubts_history TO authenticated;
DROP POLICY IF EXISTS "select_own_doubts" ON doubts_history;
CREATE POLICY "select_own_doubts" ON doubts_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_doubts" ON doubts_history;
CREATE POLICY "insert_own_doubts" ON doubts_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_doubts" ON doubts_history;
CREATE POLICY "update_own_doubts" ON doubts_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_doubts" ON doubts_history;
CREATE POLICY "delete_own_doubts" ON doubts_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. revision_queue
CREATE TABLE IF NOT EXISTS revision_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('weak-score','deadline-approaching','not-practiced')),
  priority int NOT NULL DEFAULT 50,
  detail text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE revision_queue ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON revision_queue TO authenticated;
DROP POLICY IF EXISTS "select_own_revision" ON revision_queue;
CREATE POLICY "select_own_revision" ON revision_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_revision" ON revision_queue;
CREATE POLICY "insert_own_revision" ON revision_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_revision" ON revision_queue;
CREATE POLICY "update_own_revision" ON revision_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_revision" ON revision_queue;
CREATE POLICY "delete_own_revision" ON revision_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9. arcade_stats (single row per user)
CREATE TABLE IF NOT EXISTS arcade_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp int NOT NULL DEFAULT 0,
  games_played int NOT NULL DEFAULT 0,
  achievements text[] NOT NULL DEFAULT '{}',
  best_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE arcade_stats ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON arcade_stats TO authenticated;
DROP POLICY IF EXISTS "select_own_arcade" ON arcade_stats;
CREATE POLICY "select_own_arcade" ON arcade_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_arcade" ON arcade_stats;
CREATE POLICY "insert_own_arcade" ON arcade_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_arcade" ON arcade_stats;
CREATE POLICY "update_own_arcade" ON arcade_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_arcade" ON arcade_stats;
CREATE POLICY "delete_own_arcade" ON arcade_stats FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 10. circle_memberships
CREATE TABLE IF NOT EXISTS circle_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, circle_id)
);
ALTER TABLE circle_memberships ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON circle_memberships TO authenticated;
DROP POLICY IF EXISTS "select_own_circles" ON circle_memberships;
CREATE POLICY "select_own_circles" ON circle_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_circles" ON circle_memberships;
CREATE POLICY "insert_own_circles" ON circle_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_circles" ON circle_memberships;
CREATE POLICY "update_own_circles" ON circle_memberships FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_circles" ON circle_memberships;
CREATE POLICY "delete_own_circles" ON circle_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 11. circle_posts
CREATE TABLE IF NOT EXISTS circle_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id text NOT NULL,
  author text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE circle_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON circle_posts TO authenticated;
DROP POLICY IF EXISTS "select_own_posts" ON circle_posts;
CREATE POLICY "select_own_posts" ON circle_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_posts" ON circle_posts;
CREATE POLICY "insert_own_posts" ON circle_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_posts" ON circle_posts;
CREATE POLICY "update_own_posts" ON circle_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_posts" ON circle_posts;
CREATE POLICY "delete_own_posts" ON circle_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle ON circle_posts(circle_id);
