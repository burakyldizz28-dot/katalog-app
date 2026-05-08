export const CATEGORIES = [
  'Elektronik',
  'Tekstil & Giyim',
  'Gıda & İçecek',
  'Kozmetik & Kişisel Bakım',
  'Ev & Yaşam',
  'Spor & Outdoor',
  'Oyuncak & Hobi',
  'Kırtasiye & Ofis',
  'Yapı & Dekorasyon',
  'Otomotiv',
  'Sağlık & Medikal',
  'Diğer',
] as const

export type Category = (typeof CATEGORIES)[number]
