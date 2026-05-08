import type { Metadata } from 'next'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Navbar } from '@/components/layout/Navbar'
import { EditProductClient } from './EditProductClient'

export const metadata: Metadata = {
  title: 'Ürün Düzenle',
}

export default function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ürün Düzenle</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ürün bilgilerini güncelleyin
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl shadow-sm p-5 sm:p-7">
            <EditProductClient productId={params.id} />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
