import { createClient } from '@supabase/supabase-js'

// .env.local 파일에 설정된 환경변수를 불러옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 1. 반드시 'export const supabase' 형태로 내보내야 합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)