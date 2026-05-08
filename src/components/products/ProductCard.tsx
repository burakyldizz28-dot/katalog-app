'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Eye, Pencil, DollarSign, Package } from 'lucide-react'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/cn'
import { usePresentationMode } from '@/lib/hooks/usePresentationMode'

interface ProductCardProps {
  product: Product
  isAdmin: boolean
  onViewDetail: (product: Product) => void
  onEdit?: (product: Product) => void
  onPriceEdit?: (product: Product) => void
}

export function ProductCard({
  product,
  isAdmin,
  onViewDetail,
  onEdit,
  onPriceEdit,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const { presentationMode } = usePresentationMode()

  return (
    <div className="product-card group overflow-hidden flex flex-col">
      {/* Görsel */}
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-slate-50"
        onClick={() => onViewDetail(product)}
      >
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="image-placeholder w-full h-full">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {!product.is_active && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-red text-xs">Pasif</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      {/* Kart içeriği */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <span className="badge badge-blue text-xs self-start">{product.category}</span>

        <div className="cursor-pointer" onClick={() => onViewDetail(product)}>
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">#{product.sku}</p>
        </div>

        {/* Fiyatlar — sunum modunda toptan gizli */}
        <div className="flex gap-2 mt-auto pt-1">
          <div className={cn('price-box-retail', presentationMode ? 'w-full' : 'flex-1')}>
            <p className="text-xs text-blue-600 font-medium mb-0.5">Perakende</p>
            <p className="text-sm font-bold text-blue-700">{formatPrice(product.retail_price)}</p>
          </div>
          {!presentationMode && (
            <div className="flex-1 price-box-wholesale">
              <p className="text-xs text-green-600 font-medium mb-0.5">Toptan</p>
              <p className="text-sm font-bold text-green-700">{formatPrice(product.wholesale_price)}</p>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className={cn('flex gap-1.5 pt-1', isAdmin ? 'flex-col' : '')}>
          <button
            onClick={() => onViewDetail(product)}
            className="btn-secondary flex-1 text-xs py-2 gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Detaylar
          </button>

          {isAdmin && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onPriceEdit?.(product)}
                className="btn-secondary flex-1 text-xs py-2 gap-1 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Fiyat
              </button>
              <button
                onClick={() => onEdit?.(product)}
                className="btn-secondary flex-1 text-xs py-2 gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                Düzenle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}