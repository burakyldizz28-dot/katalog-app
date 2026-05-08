'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Package,
  Pencil,
  DollarSign,
  Tag,
  Hash,
  Maximize2,
  ClipboardList,
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/cn'
import { usePresentationMode } from '@/lib/hooks/usePresentationMode'

interface ProductDetailModalProps {
  product: Product | null
  isAdmin: boolean
  onClose: () => void
  onEdit?: (product: Product) => void
  onPriceEdit?: (product: Product) => void
}

export function ProductDetailModal({
  product,
  isAdmin,
  onClose,
  onEdit,
  onPriceEdit,
}: ProductDetailModalProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { presentationMode } = usePresentationMode()

  if (!product) return null

  const handleCreateOrder = () => {
    router.push('/orders?productId=' + product.id)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
            <h2 className="font-bold text-foreground text-lg">Ürün Detayı</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Sol — Görsel */}
              <div className="sm:w-2/5 flex-shrink-0">
                <div
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-border',
                    product.image_url && !imgError && 'cursor-zoom-in'
                  )}
                  onClick={() => {
                    if (product.image_url && !imgError) setLightboxOpen(true)
                  }}
                >
                  {product.image_url && !imgError ? (
                    <>
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className="object-cover"
                        onError={() => setImgError(true)}
                      />
                      <div className="absolute top-2 right-2 bg-black/40 text-white rounded-md p-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </>
                  ) : (
                    <div className="image-placeholder w-full h-full">
                      <Package className="w-14 h-14 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Mobil admin butonları */}
                {isAdmin && (
                  <div className="flex flex-col gap-2 mt-3 sm:hidden">
                    <button
                      onClick={handleCreateOrder}
                      className="btn-primary text-sm gap-1.5 w-full"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Sipariş Oluştur
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onPriceEdit?.(product)
                          onClose()
                        }}
                        className="btn-secondary flex-1 text-sm gap-1.5 text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <DollarSign className="w-4 h-4" />
                        Fiyat
                      </button>
                      <button
                        onClick={() => {
                          onEdit?.(product)
                        }}
                        className="btn-secondary flex-1 text-sm gap-1.5"
                      >
                        <Pencil className="w-4 h-4" />
                        Düzenle
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sağ — Bilgiler */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge-blue">{product.category}</span>
                  {product.is_active ? (
                    <span className="badge badge-green">Aktif</span>
                  ) : (
                    <span className="badge badge-red">Pasif</span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Ürün Kodu: </span>
                    <span className="font-mono font-medium text-foreground">{product.sku}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Kategori: </span>
                    <span className="font-medium text-foreground">{product.category}</span>
                  </div>
                </div>

                {product.description && (
                  <div className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    <p className="font-medium text-foreground mb-1">Açıklama</p>
                    <p>{product.description}</p>
                  </div>
                )}

                {/* Fiyatlar — sunum modunda toptan gizli */}
                <div
                  className={cn(
                    'grid gap-3 mt-auto',
                    presentationMode ? 'grid-cols-1' : 'grid-cols-2'
                  )}
                >
                  <div className="price-box-retail">
                    <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                      Perakende Fiyatı
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatPrice(product.retail_price)}
                    </p>
                  </div>
                  {!presentationMode && (
                    <div className="price-box-wholesale">
                      <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">
                        Toptan Fiyatı
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        {formatPrice(product.wholesale_price)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Masaüstü admin butonları */}
                {isAdmin && (
                  <div className="hidden sm:flex flex-col gap-2 pt-2 border-t border-border">
                    <button
                      onClick={handleCreateOrder}
                      className="btn-primary text-sm gap-1.5 w-full"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Sipariş Oluştur
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onPriceEdit?.(product)
                          onClose()
                        }}
                        className="btn-secondary flex-1 text-sm gap-1.5 text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <DollarSign className="w-4 h-4" />
                        Fiyat Değiştir
                      </button>
                      <button
                        onClick={() => {
                          onEdit?.(product)
                        }}
                        className="btn-secondary flex-1 text-sm gap-1.5"
                      >
                        <Pencil className="w-4 h-4" />
                        Düzenle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && product.image_url && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-2xl aspect-square">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}