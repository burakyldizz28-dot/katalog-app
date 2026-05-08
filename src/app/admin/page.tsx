import type { Metadata } from 'next'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Navbar } from '@/components/layout/Navbar'
import { AdminPageClient } from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Yönetim Paneli',
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Yönetim Paneli</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kullanıcılar ve sistem istatistikleri
            </p>
          </div>
          <AdminPageClient />
        </main>
      </div>
    </AuthGuard>
  )
}
