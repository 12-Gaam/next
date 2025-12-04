import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key for server-side operations (bypasses RLS)
// Fall back to anon key if service role key is not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

/**
 * Shared Supabase client instance
 * 
 * IMPORTANT: This is a SINGLETON - only ONE instance is created and reused
 * across all API routes and server actions. This prevents connection overload.
 * 
 * DO NOT create new clients in API routes or server actions.
 * Always import and use this shared instance.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': '12gaam-nextjs',
    },
  },
  // Connection pooling configuration
  // This ensures connections are reused efficiently
  auth: {
    persistSession: false, // Server-side doesn't need session persistence
    autoRefreshToken: false, // Server-side doesn't need token refresh
  },
})
