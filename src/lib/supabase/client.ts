import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Yapılandırma kontrolü — eksik değerler için anlaşılır hata
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error(
    '[Katalog] NEXT_PUBLIC_SUPABASE_URL eksik veya geçersiz.\n' +
    '.env.local dosyasına Supabase proje URL\'nizi ekleyin.\n' +
    'Örnek: NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co'
  )
}

if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
  throw new Error(
    '[Katalog] NEXT_PUBLIC_SUPABASE_ANON_KEY eksik veya geçersiz.\n' +
    '.env.local dosyasına Supabase anon public key\'i ekleyin.'
  )
}

// Singleton pattern — tek bir client instance kullan
// Bu sayede her render'da yeni client oluşmaz ve session tutarlı kalır
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!_client) {
    _client = createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  }
  return _client
}
