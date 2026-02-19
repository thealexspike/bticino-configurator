import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://xdrexercxxbgsobmtvfr.supabase.co'
export const supabaseAnonKey = 'sb_publishable_dAk_FFkjADjlWKRGLLV23Q_77IQmtLH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
