'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  X,
  ClipboardList,
  Hash,
  MapPin,
  StickyNote,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useOrders, type Order } from '@/lib/hooks/useOrders'
import { usePresentationMode } from '@/lib/hooks/usePresentationMode'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { formatPrice } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/cn'

interface ProductOption {
  id: string
  name: string
  sku: string
  wholesale_price: number
}

type FilterType = 'all' | 'pending' | 'completed'

export function OrdersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetProductId = searchParams.get('productId')

  const {
    orders,
    loading,
    createOrder,
    markCompleted,
    markPending,
    deleteOrder,
  } = useOrders()
  const { presentationMode } = usePresentationMode()

  const [filter, setFilter] = useState<FilterType>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [form, setForm] = useState({
    customer_name: '',
    customer_address: '',
    product_id: '',
    quantity: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  // Aktif ürünleri çek (toptan fiyatla birlikte — toplam hesabı için)
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('id, name, sku, wholesale_price')
      .eq('is_active', true)
      .order('name')
      .then((res) => {
        if (res.data) setProducts(res.data as ProductOption[])
        setLoadingProducts(false)
      })
  }, [])

  // URL'den gelen önceden seçili ürünü işle
  useEffect(() => {
    if (presetProductId && products.length > 0) {
      const exists = products.find((p) => p.id === presetProductId)
      if (exists) {
        setForm((prev) => ({ ...prev, product_id: presetProductId }))
        setShowForm(true)
      }
    }
  }, [presetProductId, products])

  const closeForm = () => {
    setShowForm(false)
    if (presetProductId) {
      router.replace('/orders')
    }
  }

  // Filtreleme: durum + arama
  const filteredOrders = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      const matchesCustomer = o.customer_name.toLowerCase().includes(term)
      const matchesProduct = o.product_name.toLowerCase().includes(term)
      if (!matchesCustomer && !matchesProduct) return false
    }
    return true
  })

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const completedCount = orders.filter((o) => o.status === 'completed').length

  const resetForm = () => {
    setForm({
      customer_name: '',
      customer_address: '',
      product_id: '',
      quantity: '',
      notes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customer_name.trim()) {
      toast.error('Müşteri adı zorunlu')
      return
    }
    if (!form.product_id) {
      toast.error('Ürün seçimi zorunlu')
      return
    }
    const qty = parseInt(form.quantity, 10)
    if (!qty || qty <= 0) {
      toast.error('Geçerli bir adet girin')
      return
    }

    const product = products.find((p) => p.id === form.product_id)
    if (!product) {
      toast.error('Ürün bulunamadı')
      return
    }

    setSaving(true)
    const result = await createOrder({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      customer_name: form.customer_name.trim(),
      customer_address: form.customer_address.trim() || null,
      quantity: qty,
      unit_price: product.wholesale_price,
      notes: form.notes.trim() || null,
    })
    setSaving(false)

    if (result.error) {
      toast.error('Sipariş eklenemedi: ' + result.error)
    } else {
      toast.success('Sipariş eklendi')
      resetForm()
      closeForm()
    }
  }

  const handleToggleStatus = async (order: Order) => {
    if (order.status === 'completed') {
      const result = await markPending(order.id)
      if (result.error) toast.error(result.error)
      else toast.success('Sipariş beklemeye alındı')
    } else {
      const result = await markCompleted(order.id)
      if (result.error) toast.error(result.error)
      else toast.success('Sipariş tamamlandı')
    }
  }

  const handleDelete = async (order: Order) => {
    const ok = window.confirm(
      'Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
    )
    if (!ok) return

    const result = await deleteOrder(order.id)
    if (result.error) toast.error(result.error)
    else toast.success('Sipariş silindi')
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Geri butonu */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kataloğa Dön
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Siparişler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Müşteri siparişlerini buradan takip edebilirsiniz
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Yeni Sipariş
        </button>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Müşteri veya ürün adı ile ara..."
          className="form-input pl-9"
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter('pending')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            filter === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
          )}
        >
          Beklemede ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            filter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
          )}
        >
          Tamamlandı ({completedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary/10 text-primary'
              : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
          )}
        >
          Tümü ({orders.length})
        </button>
      </div>

      {/* Sipariş listesi */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-slate-50">
          <ClipboardList className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchTerm.trim()
              ? 'Aramayla eşleşen sipariş yok'
              : filter === 'pending'
              ? 'Bekleyen sipariş yok'
              : filter === 'completed'
              ? 'Tamamlanan sipariş yok'
              : 'Henüz sipariş yok'}
          </p>
          {!searchTerm.trim() && filter !== 'pending' && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-primary hover:underline mt-2"
            >
              Yeni sipariş ekle
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const total =
              order.unit_price != null ? order.unit_price * order.quantity : null

            return (
              <div
                key={order.id}
                className={cn(
                  'rounded-xl border p-4 bg-white transition-shadow hover:shadow-sm',
                  order.status === 'completed'
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-foreground">
                        {order.customer_name}
                      </h3>
                      {order.status === 'completed' ? (
                        <span className="badge badge-green">Tamamlandı</span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700 border-amber-200">
                          Beklemede
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium text-foreground">
                        {order.product_name}
                      </span>
                      {order.product_sku && (
                        <span className="font-mono text-xs">
                          #{order.product_sku}
                        </span>
                      )}
                      <span className="text-foreground">
                        — {order.quantity} adet
                      </span>
                      {/* Toplam — sunum modu kapalıyken */}
                      {!presentationMode && total != null && (
                        <span className="font-semibold text-green-700 ml-1">
                          = {formatPrice(total)}
                        </span>
                      )}
                    </div>

                    {order.customer_address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{order.customer_address}</span>
                      </div>
                    )}

                    {order.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1.5">
                        <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{order.notes}</span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(order)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        order.status === 'completed'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      )}
                    >
                      {order.status === 'completed' ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Beklemeye Al
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Tamamlandı
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Yeni Sipariş Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !saving && closeForm()}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
                <h2 className="font-bold text-foreground text-lg">Yeni Sipariş</h2>
                <button
                  type="button"
                  onClick={() => !saving && closeForm()}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Müşteri Adı <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="customer_name"
                    type="text"
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm({ ...form, customer_name: e.target.value })
                    }
                    placeholder="Örn. X Kırtasiye"
                    className="form-input"
                    disabled={saving}
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_address"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Adres (opsiyonel)
                  </label>
                  <textarea
                    id="customer_address"
                    value={form.customer_address}
                    onChange={(e) =>
                      setForm({ ...form, customer_address: e.target.value })
                    }
                    placeholder="Açık adres veya semt/şehir"
                    rows={2}
                    className="form-input resize-none"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product_id"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Ürün <span className="text-destructive">*</span>
                  </label>
                  {loadingProducts ? (
                    <div className="form-input text-muted-foreground">
                      Ürünler yükleniyor...
                    </div>
                  ) : (
                    <select
                      id="product_id"
                      value={form.product_id}
                      onChange={(e) =>
                        setForm({ ...form, product_id: e.target.value })
                      }
                      className="form-input bg-white cursor-pointer"
                      disabled={saving}
                    >
                      <option value="">Ürün seçin</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.sku ? ' — ' + p.sku : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Adet <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    placeholder="0"
                    className="form-input"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Not (opsiyonel)
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Örn. Pazartesi teslim, ödeme cuma"
                    rows={2}
                    className="form-input resize-none"
                    disabled={saving}
                  />
                </div>

                <div className="flex gap-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => !saving && closeForm()}
                    disabled={saving}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}