import { createBrowserClient } from '@supabase/ssr'

// Untyped Supabase client for cases where database types are incomplete
// This should be used temporarily until all database types are properly generated
export function createUntypedClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}