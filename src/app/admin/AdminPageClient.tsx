'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProducts } from '@/lib/hooks/useProducts'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Profile } from '@/lib/types'
import {
  Users,
  Package,
  PackageCheck,
  PackageX,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/formatPrice'

export function AdminPageClient() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const { products, loading: loadingProducts } = useProducts({ isActive: null })
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at')
      setProfiles(data ?? [])
      setLoadingProfiles(false)
    }
    fetchProfiles()
  }, [supabase])

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'sales') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Rol güncellenemedi')
    } else {
      toast.success('Rol güncellendi')
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      )
    }
  }

  // İstatistikler
  const activeProducts = products.filter((p) => p.is_active).length
  const inactiveProducts = products.filter((p) => !p.is_active).length
  const adminCount = profiles.filter((p) => p.role === 'admin').length
  const salesCount = profiles.filter((p) => p.role === 'sales').length

  return (
    <div className="space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Toplam Ürün',
            value: products.length,
            icon: Package,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Aktif Ürün',
            value: activeProducts,
            icon: PackageCheck,
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Pasif Ürün',
            value: inactiveProducts,
            icon: PackageX,
            color: 'bg-red-50 text-red-600',
          },
          {
            label: 'Kullanıcı',
            value: profiles.length,
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loadingProducts ? '–' : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcılar */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Kullanıcılar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {adminCount} yönetici, {salesCount} satış temsilcisi
          </p>
        </div>

        {loadingProfiles ? (
          <div className="py-10">
            <PageLoader />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between px-5 py-4 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {profile.full_name?.[0]?.toUpperCase() ||
                        profile.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`badge ${
                      profile.role === 'admin' ? 'badge-blue' : 'badge-green'
                    }`}
                  >
                    {profile.role === 'admin' ? (
                      <>
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Yönetici
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Satış
                      </>
                    )}
                  </span>
                  <select
                    value={profile.role}
                    onChange={(e) =>
                      handleRoleChange(profile.id, e.target.value as 'admin' | 'sales')
                    }
                    className="text-xs border border-border rounded-md px-2 py-1 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="sales">Sales</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kategori dağılımı */}
      {!loadingProducts && products.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Kategori Dağılımı</h2>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {Object.entries(
                products.reduce<Record<string, number>>((acc, p) => {
                  acc[p.category] = (acc[p.category] || 0) + 1
                  return acc
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 truncate">{cat}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(count / products.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
