/*
# Add education level columns to profiles table

## Purpose
Stores the student's selected education level so quizzes, missions,
and dashboard suggestions can be personalized to their class/college/year.

## Changes to existing table: `profiles`
- `education_level_id` (text, nullable) — ID from EDUCATION_LEVELS, e.g. 'class-10', 'eng-first-year', 'mbbs'
- `education_sub_selection` (text, nullable) — engineering branch name or MBBS year
- `preferred_subjects` (text[], nullable, default '{}') — array of subjects the student selected

## Security
- No new policies needed — the columns are covered by existing owner-scoped RLS policies on `profiles`.
- No new grants needed — `authenticated` already has INSERT/UPDATE on the table.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS education_level_id text,
  ADD COLUMN IF NOT EXISTS education_sub_selection text,
  ADD COLUMN IF NOT EXISTS preferred_subjects text[] DEFAULT '{}';
