'use client'

import { useState } from 'react'
import { X, DollarSign, AlertCircle } from 'lucide-react'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { validatePriceForm } from '@/lib/utils/validators'
import { toast } from 'sonner'

interface PriceEditModalProps {
  product: Product | null
  onClose: () => void
  onSave: (id: string, retail_price: number, wholesale_price: number) => Promise<{ error: string | null }>
}

export function PriceEditModal({ product, onClose, onSave }: PriceEditModalProps) {
  const [retailPrice, setRetailPrice] = useState(
    product ? String(product.retail_price) : ''
  )
  const [wholesalePrice, setWholesalePrice] = useState(
    product ? String(product.wholesale_price) : ''
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!product) return null

  const handleSave = async () => {
    const validationErrors = validatePriceForm({
      retail_price: retailPrice,
      wholesale_price: wholesalePrice,
    })

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((e) => {
        errorMap[e.field] = e.message
      })
      setErrors(errorMap)
      return
    }

    setErrors({})
    setLoading(true)

    const { error } = await onSave(
      product.id,
      parseFloat(retailPrice),
      parseFloat(wholesalePrice)
    )

    setLoading(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Fiyatlar başarıyla güncellendi')
      onClose()
    }
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Fiyat Güncelle</h2>
                <p className="text-xs text-muted-foreground">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Mevcut fiyatlar */}
            <div className="bg-slate-50 rounded-lg p-3 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Mevcut Fiyatlar</p>
              <div className="flex gap-3">
                <div>
                  <p className="text-xs text-blue-600">Perakende</p>
                  <p className="font-semibold text-blue-700">{formatPrice(product.retail_price)}</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xs text-green-600">Toptan</p>
                  <p className="font-semibold text-green-700">{formatPrice(product.wholesale_price)}</p>
                </div>
              </div>
            </div>

            {/* Perakende fiyatı */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Yeni Perakende Fiyatı (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={retailPrice}
                onChange={(e) => {
                  setRetailPrice(e.target.value)
                  if (errors.retail_price) {
                    setErrors((prev) => ({ ...prev, retail_price: '' }))
                  }
                }}
                placeholder="0.00"
                className="form-input"
                disabled={loading}
              />
              {errors.retail_price && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.retail_price}</p>
                </div>
              )}
            </div>

            {/* Toptan fiyatı */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Yeni Toptan Fiyatı (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={wholesalePrice}
                onChange={(e) => {
                  setWholesalePrice(e.target.value)
                  if (errors.wholesale_price) {
                    setErrors((prev) => ({ ...prev, wholesale_price: '' }))
                  }
                }}
                placeholder="0.00"
                className="form-input"
                disabled={loading}
              />
              {errors.wholesale_price && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.wholesale_price}</p>
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary flex-1 gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Fiyatları Güncelle'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
