-- ============================================================
-- AlphaMath — Exams table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- Stores dynamically-added exams uploaded via the admin panel.
-- Existing static exams in src/datas/years/ are NOT migrated —
-- they stay as built-in fallbacks. Supabase rows take precedence
-- when the same year+variant exists in both places.
-- ============================================================

CREATE TABLE IF NOT EXISTS exams (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  year           integer     NOT NULL,
  variant        text        NOT NULL CHECK (variant IN ('A','B','C','D')),
  scoring        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  problem        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  second_problem jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (year, variant)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out users) can read exams
CREATE POLICY "Public can read exams" ON exams
  FOR SELECT USING (true);

-- Only admin emails can insert / update / delete
CREATE POLICY "Admin can manage exams" ON exams
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[]))
  WITH CHECK ((auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[]));
