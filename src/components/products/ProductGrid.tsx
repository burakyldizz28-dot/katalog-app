'use client'

import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isAdmin: boolean
  onViewDetail: (product: Product) => void
  onEdit?: (product: Product) => void
  onPriceEdit?: (product: Product) => void
}

export function ProductGrid({
  products,
  isAdmin,
  onViewDetail,
  onEdit,
  onPriceEdit,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
        >
          <ProductCard
            product={product}
            isAdmin={isAdmin}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onPriceEdit={onPriceEdit}
          />
        </div>
      ))}
    </div>
  )
}
