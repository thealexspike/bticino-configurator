import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://xdrexercxxbgsobmtvfr.supabase.co'
const supabaseAnonKey = 'sb_publishable_dAk_FFkjADjlWKRGLLV23Q_77IQmtLH'
export const supabaseAnonKeyLegacy = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcmV4ZXJjeHhiZ3NvYm10dmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzM1NDAsImV4cCI6MjA4MjYwOTU0MH0.mqAgZ7cI20XSezMQg43G46aKevLMa8Oc97HGpWN7VqE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
