'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useProducts } from '@/lib/hooks/useProducts'
import { ProductForm } from '@/components/products/ProductForm'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductUpdate } from '@/lib/types'

interface EditProductClientProps {
  productId: string
}

export function EditProductClient({ productId }: EditProductClientProps) {
  const router = useRouter()
  const { getProduct, updateProduct } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const result = await getProduct(productId)
      if (result.error || !result.data) {
        setFetchError(result.error || 'Ürün bulunamadı')
      } else {
        setProduct(result.data)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!product) return

    const ok = window.confirm(
      'Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
    )
    if (!ok) return

    setDeleting(true)
    const supabase = createClient()

    if (product.image_url) {
      try {
        const url = product.image_url
        const marker = '/product-images/'
        const idx = url.indexOf(marker)
        if (idx >= 0) {
          const path = url.substring(idx + marker.length)
          await supabase.storage.from('product-images').remove([path])
        }
      } catch (e) {
        // ignore storage errors so product can still be deleted
      }
    }

    const deleteResult = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    setDeleting(false)

    if (deleteResult.error) {
      toast.error('Ürün silinemedi: ' + deleteResult.error.message)
      return
    }

    toast.success('Ürün silindi')
    router.push('/dashboard')
  }

  if (loading) {
    return <PageLoader />
  }

  if (fetchError || !product) {
    return <ErrorState message={fetchError || 'Ürün bulunamadı'} />
  }

  return (
    <div className="space-y-6">
      <ProductForm
        initialData={product}
        onSubmit={(data) => updateProduct(product.id, data as ProductUpdate)}
        submitLabel="Değişiklikleri Kaydet"
      />

      <div className="border-t border-red-200 pt-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-semibold text-red-600 text-sm">
              Tehlikeli Bölge
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Bu ürünü kalıcı olarak siler. İşlem geri alınamaz.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Siliniyor...' : 'Ürünü Sil'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}