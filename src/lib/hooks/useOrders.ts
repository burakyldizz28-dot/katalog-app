'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrderStatus = 'pending' | 'completed'

export interface Order {
  id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  customer_name: string
  customer_address: string | null
  quantity: number
  unit_price: number | null
  notes: string | null
  status: OrderStatus
  created_at: string
  completed_at: string | null
}

export interface OrderInsert {
  product_id: string | null
  product_name: string
  product_sku: string | null
  customer_name: string
  customer_address?: string | null
  quantity: number
  unit_price?: number | null
  notes?: string | null
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setOrders([])
    } else {
      setError(null)
      setOrders((data || []) as Order[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(
    async (input: OrderInsert) => {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('orders')
        .insert(input)
        .select()
        .single()

      if (err) {
        return { data: null, error: err.message }
      }
      await fetchOrders()
      return { data: data as Order, error: null }
    },
    [fetchOrders]
  )

  const markCompleted = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('orders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id)

      if (err) return { error: err.message }
      await fetchOrders()
      return { error: null }
    },
    [fetchOrders]
  )

  const markPending = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('orders')
        .update({ status: 'pending', completed_at: null })
        .eq('id', id)

      if (err) return { error: err.message }
      await fetchOrders()
      return { error: null }
    },
    [fetchOrders]
  )

  const deleteOrder = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error: err } = await supabase.from('orders').delete().eq('id', id)

      if (err) return { error: err.message }
      await fetchOrders()
      return { error: null }
    },
    [fetchOrders]
  )

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
    markCompleted,
    markPending,
    deleteOrder,
  }
}