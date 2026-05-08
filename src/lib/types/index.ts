// ─────────────────────────────────────────────────────
// TypeScript Tipleri — Tüm uygulama genelinde kullanılır
// ─────────────────────────────────────────────────────

export type UserRole = 'admin' | 'sales'

export interface Profile {
  id: string
  username: string
  internal_email: string
  real_email: string | null
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  description: string | null
  image_url: string | null
  retail_price: number
  wholesale_price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>

export type ProductUpdate = Partial<ProductInsert>

export interface ProductFilters {
  search?: string
  category?: string
  isActive?: boolean | null
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}
