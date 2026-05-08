'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useImageUpload } from '@/lib/hooks/useImageUpload'
import { validateProductForm } from '@/lib/utils/validators'
import { CATEGORIES } from '@/constants/categories'
import {
  Upload,
  X,
  AlertCircle,
  Package,
  ImageOff,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Product, ProductInsert, ProductUpdate } from '@/lib/types'

interface ProductFormProps {
  initialData?: Product
  onSubmit: (
    data: ProductInsert | ProductUpdate
  ) => Promise<{ error: string | null }>
  submitLabel?: string
}

export function ProductForm({
  initialData,
  onSubmit,
  submitLabel = 'Kaydet',
}: ProductFormProps) {
  const router = useRouter()
  const { uploadImage, uploading, uploadError } = useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    sku: initialData?.sku ?? '',
    category: initialData?.category ?? '',
    description: initialData?.description ?? '',
    retail_price: initialData?.retail_price?.toString() ?? '',
    wholesale_price: initialData?.wholesale_price?.toString() ?? '',
    is_active: initialData?.is_active ?? true,
  })
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url ?? null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Önizleme
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    const { url, error } = await uploadImage(file)
    if (error) {
      toast.error(error)
      setImagePreview(imageUrl) // önceki görüntüye geri dön
      return
    }
    setImageUrl(url)
    toast.success('Görsel yüklendi')
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // SKU otomatik: mevcut ürünse var olanı koru, yeni ürünse timestamp'ten üret
    const autoSku = 'SKU-' + Date.now()
    const finalSku = initialData?.sku || form.sku || autoSku

    const validationErrors = validateProductForm({
      name: form.name,
      sku: finalSku,
      category: form.category,
      retail_price: form.retail_price,
      wholesale_price: form.wholesale_price,
    })

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message
      })
      setFieldErrors(errorMap)
      // İlk hataya scroll
      const firstErrorField = validationErrors[0].field
      document.getElementById(firstErrorField)?.focus()
      return
    }

    setSaving(true)

    const productData = {
      name: form.name.trim(),
      sku: finalSku.trim().toUpperCase(),
      category: form.category,
      description: form.description.trim() || null,
      image_url: imageUrl,
      retail_price: parseFloat(form.retail_price),
      wholesale_price: parseFloat(form.wholesale_price),
      is_active: form.is_active,
    }

    const { error } = await onSubmit(productData)
    setSaving(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success(initialData ? 'Ürün güncellendi' : 'Ürün eklendi')
      router.push('/dashboard')
    }
  }

  const ErrorMessage = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <div className="flex items-center gap-1.5 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
        <p className="text-xs text-destructive">{fieldErrors[field]}</p>
      </div>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol kolon */}
        <div className="space-y-5">
          {/* Ürün Adı */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Ürün Adı <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Ürün adını girin"
              className="form-input"
              disabled={saving}
            />
            <ErrorMessage field="name" />
          </div>

          

          {/* Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
              Kategori <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="form-input appearance-none cursor-pointer bg-white"
              disabled={saving}
            >
              <option value="">Kategori seçin</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ErrorMessage field="category" />
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
              Açıklama
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Ürün açıklaması (opsiyonel)"
              rows={4}
              className="form-input resize-none"
              disabled={saving}
            />
          </div>

          {/* Aktif/Pasif */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-slate-50">
            <div>
              <p className="text-sm font-medium text-foreground">Ürün Durumu</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.is_active ? 'Ürün katalogda görünür' : 'Ürün gizlenmiş'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => handleFieldChange('is_active', !form.is_active)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                form.is_active ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-5">
          {/* Görsel yükleme */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ürün Görseli
            </label>

            {imagePreview ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-border">
                <Image
                  src={imagePreview}
                  alt="Ürün önizleme"
                  fill
                  className="object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {!uploading && imageUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading || saving}
                  className="absolute top-2 left-2 bg-black/50 text-white rounded-md p-1 hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Görsel yükle</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP — Maks. 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
              disabled={saving}
            />

            {uploadError && (
              <div className="flex items-center gap-1.5 mt-2">
                <ImageOff className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">{uploadError}</p>
              </div>
            )}

            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
                className="btn-secondary w-full mt-2 text-sm gap-1.5"
              >
                <Package className="w-4 h-4" />
                {uploading ? 'Yükleniyor...' : 'Görsel Seç'}
              </button>
            )}
          </div>

          {/* Fiyatlar */}
          <div className="bg-slate-50 border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Fiyat Bilgileri</h3>

            <div>
              <label htmlFor="retail_price" className="block text-sm font-medium text-foreground mb-1.5">
                Perakende Fiyatı (₺) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₺</span>
                <input
                  id="retail_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.retail_price}
                  onChange={(e) => handleFieldChange('retail_price', e.target.value)}
                  placeholder="0.00"
                  className="form-input pl-8"
                  disabled={saving}
                />
              </div>
              <ErrorMessage field="retail_price" />
            </div>

            <div>
              <label htmlFor="wholesale_price" className="block text-sm font-medium text-foreground mb-1.5">
                Toptan Fiyatı (₺) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₺</span>
                <input
                  id="wholesale_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wholesale_price}
                  onChange={(e) => handleFieldChange('wholesale_price', e.target.value)}
                  placeholder="0.00"
                  className="form-input pl-8"
                  disabled={saving}
                />
              </div>
              <ErrorMessage field="wholesale_price" />
            </div>
          </div>
        </div>
      </div>

      {/* Kaydet butonları */}
      <div className="flex gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="btn-secondary flex-1 sm:flex-none sm:px-8"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-primary flex-1 sm:flex-none sm:px-8 gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
