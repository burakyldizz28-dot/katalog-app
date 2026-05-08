import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  // Yapılandırma kontrolü
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

  const cookieStore = cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component'te çağrıldığında cookie set edilemez — middleware halleder
        }
      },
    },
  })
}
