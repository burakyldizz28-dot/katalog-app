'use client'

import { CATEGORIES } from '@/constants/categories'
import { cn } from '@/lib/utils/cn'
import { Filter } from 'lucide-react'

interface CategoryFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategoryFilter({ value, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('relative', className)}>
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input pl-9 pr-8 appearance-none cursor-pointer bg-white"
      >
        <option value="all">Tüm Kategoriler</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
