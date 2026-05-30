import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ylfibfdsdvbmmtewwtos.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmliZmRzZHZibW10ZXd3dG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMzcwNzIsImV4cCI6MjA5NTcxMzA3Mn0.eigZLD2r10KPLIlpHwYXkrnnvP3nP5n3jV90SirTi-s'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
