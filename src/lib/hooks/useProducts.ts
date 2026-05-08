'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFilters, ProductInsert, ProductUpdate } from '@/lib/types'

// Products fetch timeout (ms)
const FETCH_TIMEOUT_MS = 15_000

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    console.log('[Products] Ürün fetch başladı')
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters?.isActive !== null && filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.trim()
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      }

      // Fetch with timeout
      const fetchPromise = query
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('FETCH_TIMEOUT')), FETCH_TIMEOUT_MS)
      })

      let result
      try {
        result = await Promise.race([fetchPromise, timeoutPromise])
      } catch (raceErr) {
        if (raceErr instanceof Error && raceErr.message === 'FETCH_TIMEOUT') {
          console.error('[Products] Fetch timeout (15sn)')
          setError('Ürünler yüklenemedi — zaman aşımı. Sayfayı yenileyin.')
          return
        }
        throw raceErr
      }

      const { data, error: fetchError } = result as Awaited<typeof fetchPromise>

      if (fetchError) {
        console.error('[Products] Fetch error:', fetchError)
        setError('Ürünler yüklenirken bir hata oluştu')
        return
      }

      console.log('[Products] Ürün fetch bitti, adet:', data?.length ?? 0)
      setProducts((data as Product[]) ?? [])
    } catch (err) {
      console.error('[Products] Beklenmedik hata:', err)
      setError('Ürünler yüklenemedi. İnternet bağlantınızı kontrol edin.')
    } finally {
      // ⚡ Her durumda loading state'i kapat
      console.log('[Products] Products loading state sıfırlandı')
      setLoading(false)
    }
  }, [filters?.search, filters?.category, filters?.isActive, supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addProduct = async (product: ProductInsert): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.from('products').insert(product)
      if (error) {
        if (error.code === '23505') {
          return { error: 'Bu SKU kodu zaten kullanılıyor' }
        }
        return { error: 'Ürün eklenirken bir hata oluştu' }
      }
      await fetchProducts()
      return { error: null }
    } catch {
      return { error: 'Ürün eklenirken beklenmedik bir hata oluştu' }
    }
  }

  const updateProduct = async (
    id: string,
    updates: ProductUpdate
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.from('products').update(updates).eq('id', id)
      if (error) {
        if (error.code === '23505') {
          return { error: 'Bu SKU kodu zaten kullanılıyor' }
        }
        return { error: 'Ürün güncellenirken bir hata oluştu' }
      }
      await fetchProducts()
      return { error: null }
    } catch {
      return { error: 'Ürün güncellenirken beklenmedik bir hata oluştu' }
    }
  }

  const deleteProduct = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        return { error: 'Ürün silinirken bir hata oluştu' }
      }
      await fetchProducts()
      return { error: null }
    } catch {
      return { error: 'Ürün silinirken beklenmedik bir hata oluştu' }
    }
  }

  const getProduct = async (id: string): Promise<{ data: Product | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) {
        return { data: null, error: 'Ürün bulunamadı' }
      }
      return { data: data as Product, error: null }
    } catch {
      return { data: null, error: 'Ürün getirilirken beklenmedik bir hata oluştu' }
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  }
}
