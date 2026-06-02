-- ============================================================
-- AlphaMath — Admin RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
--
-- By default Supabase RLS only lets users read their own rows.
-- These policies additionally allow admin emails to read everything.
--
-- Edit the admin email array if needed (must match adminConfig.js).
-- ============================================================

-- ── test_results ──────────────────────────────────────────────

-- Drop the default "users read own rows" policy if it exists,
-- then recreate it combined with the admin exception.
DROP POLICY IF EXISTS "Users can read own results" ON test_results;
DROP POLICY IF EXISTS "Admin can read all results"  ON test_results;
DROP POLICY IF EXISTS "Users can insert own results" ON test_results;

CREATE POLICY "Users can read own or admin reads all" ON test_results
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[])
  );

CREATE POLICY "Users can insert own results" ON test_results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── bookmarks ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read own bookmarks"    ON bookmarks;
DROP POLICY IF EXISTS "Admin can read all bookmarks"    ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks"  ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks"  ON bookmarks;

CREATE POLICY "Users can read own or admin reads all" ON bookmarks
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[])
  );

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can delete any bookmark" ON bookmarks
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[])
  );

-- ── verify ────────────────────────────────────────────────────
-- Run this after applying policies to confirm they were created:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('test_results', 'bookmarks');
