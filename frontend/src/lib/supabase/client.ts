import { createBrowserClient } from '@supabase/ssr'

// Singleton — evita criar múltiplos clientes
let _client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    )
  }
  return _client
}
