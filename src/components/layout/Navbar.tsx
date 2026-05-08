'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePresentationMode } from '@/lib/hooks/usePresentationMode'
import {
  Package,
  Plus,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Eye,
  EyeOff,
  ClipboardList,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const { presentationMode, togglePresentationMode } = usePresentationMode()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Çıkış yapıldı')
    router.push('/login')
  }

  const handleTogglePresentation = () => {
    togglePresentationMode()
    toast.success(
      presentationMode
        ? 'Sunum modu kapatıldı'
        : 'Sunum modu açıldı — toptan fiyat gizlendi'
    )
  }

  const navLinks = [
    { href: '/dashboard', label: 'Ürün Kataloğu', icon: Package },
    { href: '/orders', label: 'Siparişler', icon: ClipboardList },
    { href: '/products/new', label: 'Ürün Ekle', icon: Plus },
    { href: '/admin', label: 'Yönetim', icon: ShieldCheck },
  ]

  const displayName = profile?.full_name || profile?.username || 'Kullanıcı'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  return (
    <header className="page-header shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Katalog</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Sağ kısım */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleTogglePresentation}
              title={
                presentationMode
                  ? 'Sunum modu açık — toptan fiyat gizli'
                  : 'Sunum modu kapalı — tüm fiyatlar görünür'
              }
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                presentationMode
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {presentationMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Sunum
            </button>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">{initial}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Yönetici</p>
              </div>
            </div>

            <div className="w-px h-6 bg-border" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>

          {/* Mobile button */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white pb-3 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => {
                handleTogglePresentation()
                setMobileOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                presentationMode
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {presentationMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {presentationMode ? 'Sunum modu açık' : 'Sunum modunu aç'}
            </button>

            <div className="border-t border-border pt-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">{initial}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Yönetici</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}