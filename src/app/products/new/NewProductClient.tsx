'use client'

import { useProducts } from '@/lib/hooks/useProducts'
import { ProductForm } from '@/components/products/ProductForm'
import type { ProductInsert } from '@/lib/types'

export function NewProductClient() {
  const { addProduct } = useProducts()

  return (
    <ProductForm
      onSubmit={(data) => addProduct(data as ProductInsert)}
      submitLabel="Ürünü Ekle"
    />
  )
}
