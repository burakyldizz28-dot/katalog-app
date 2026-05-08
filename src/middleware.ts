import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Ortam değişkeni kontrolü ──────────────────────────────────
  // Eksik/geçersiz yapılandırmada uygulamanın sessizce patlaması yerine
  // anlaşılır bir hata sayfasına yönlendir.
  const envMissing =
    !supabaseUrl ||
    !supabaseUrl.startsWith('http') ||
    !supabaseAnonKey ||
    supabaseAnonKey.length < 20 ||
    supabaseUrl.includes('your_supabase') ||
    supabaseAnonKey.includes('your_supabase')

  if (envMissing) {
    // Login ve static sayfaları etkileme — sadece korumalı rotaları koru
    if (pathname !== '/login' && pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('config_error', '1')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
  // ─────────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Login sayfasına giriş yapmış kullanıcı gelirse dashboard'a yönlendir
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Korumalı sayfalara giriş yapılmamışsa login'e yönlendir
  // MVP: Giriş yapan herkes tüm sayfalara erişebilir
  const protectedPaths = ['/dashboard', '/products', '/admin']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
