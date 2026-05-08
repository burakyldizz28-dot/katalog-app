'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Navbar } from '@/components/layout/Navbar'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import { PriceEditModal } from '@/components/products/PriceEditModal'
import { SearchBar } from '@/components/shared/SearchBar'
import { CategoryFilter } from '@/components/shared/CategoryFilter'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProducts } from '@/lib/hooks/useProducts'
import type { Product } from '@/lib/types'
import { Plus, Filter } from 'lucide-react'

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()

  // Filtreler
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showInactive, setShowInactive] = useState(false)

  // Modaller
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [priceEditProduct, setPriceEditProduct] = useState<Product | null>(null)

  const filters = useMemo(
    () => ({
      search,
      category,
      isActive: showInactive ? null : true,
    }),
    [search, category, showInactive]
  )

  const { products, loading, error, refetch, updateProduct } = useProducts(filters)

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handlePriceSave = async (
    id: string,
    retail_price: number,
    wholesale_price: number
  ) => {
    return await updateProduct(id, { retail_price, wholesale_price })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Sayfa başlığı */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ürün Kataloğu</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading ? '...' : `${products.length} ürün`}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => router.push('/products/new')}
                className="btn-primary gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ürün Ekle</span>
                <span className="sm:hidden">Ekle</span>
              </button>
            )}
          </div>

          {/* Filtreler */}
          <div className="bg-white border border-border rounded-xl p-3 sm:p-4 mb-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                className="flex-1"
              />
              <CategoryFilter
                value={category}
                onChange={setCategory}
                className="sm:w-52"
              />
              {isAdmin && (
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
                    showInactive
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-white text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {showInactive ? 'Tümü görünüyor' : 'Pasifleri göster'}
                </button>
              )}
            </div>
          </div>

          {/* İçerik */}
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : products.length === 0 ? (
            <EmptyState
              title={
                search || category !== 'all'
                  ? 'Arama sonucu bulunamadı'
                  : 'Henüz ürün eklenmemiş'
              }
              description={
                search || category !== 'all'
                  ? 'Farklı anahtar kelimeler veya kategoriler deneyin.'
                  : isAdmin
                  ? 'İlk ürünü eklemek için "Ürün Ekle" butonuna tıklayın.'
                  : 'Yakında ürünler eklenecek.'
              }
            />
          ) : (
            <ProductGrid
              products={products}
              isAdmin={isAdmin}
              onViewDetail={setSelectedProduct}
              onEdit={handleEdit}
              onPriceEdit={setPriceEditProduct}
            />
          )}
        </main>

        {/* Ürün Detay Modalı */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isAdmin={isAdmin}
            onClose={() => setSelectedProduct(null)}
            onEdit={(p) => {
              setSelectedProduct(null)
              handleEdit(p)
            }}
            onPriceEdit={(p) => {
              setSelectedProduct(null)
              setPriceEditProduct(p)
            }}
          />
        )}

        {/* Fiyat Değiştirme Modalı */}
        {priceEditProduct && (
          <PriceEditModal
            product={priceEditProduct}
            onClose={() => setPriceEditProduct(null)}
            onSave={handlePriceSave}
          />
        )}
      </div>
    </AuthGuard>
  )
}
