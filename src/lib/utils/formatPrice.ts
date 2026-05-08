/**
 * Fiyatı Türk Lirası formatında gösterir
 * Örnek: 1234.5 → "₺1.234,50"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Fiyat string'ini parse eder
 */
export function parsePrice(value: string): number {
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
