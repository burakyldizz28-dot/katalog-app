'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, profile, loading, authError, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('[AuthGuard] Kullanıcı yok, /login\'e yönlendiriliyor')
        router.replace('/login')
        return
      }
      if (requireAdmin && !isAdmin) {
        console.log('[AuthGuard] Admin değil, /dashboard\'a yönlendiriliyor')
        router.replace('/dashboard')
        return
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router, pathname])

  // Loading durumu — ama timeout sayesinde 10 saniyeden fazla sürmez
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground text-sm mt-3">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Auth hatası — sonsuz loading yerine kullanıcıya hata göster
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Bağlantı Hatası</h2>
          <p className="text-sm text-muted-foreground mb-6">{authError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sayfayı Yenile
            </button>
            <button
              onClick={() => router.replace('/login')}
              className="btn-secondary"
            >
              Giriş Sayfası
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null
  if (requireAdmin && !isAdmin) return null

  return <>{children}</>
}
