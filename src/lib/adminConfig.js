// Emails that are granted access to /admin
// Add admin email addresses here
export const ADMIN_EMAILS = [
  'k2naysaa@gmail.com',
]

// Supabase tables used by the admin panel:
//   test_results  — columns: id, user_id, year, variant, score, total_possible, percentage, answers, second_answers, created_at
//   bookmarks     — columns: id, user_id, year, variant, question_id, question_text, created_at
//
// For the admin queries to return data you need one of:
//   A) RLS policy that allows reads when auth.jwt() ->> 'email' is in ADMIN_EMAILS
//   B) Supabase service role key (set VITE_SUPABASE_SERVICE_KEY in .env.local)
//   C) Disable RLS on those tables for local development
