export interface ValidationError {
  field: string
  message: string
}

export function validateProductForm(data: {
  name: string
  sku: string
  category: string
  retail_price: string | number
  wholesale_price: string | number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.name || String(data.name).trim() === '') {
    errors.push({ field: 'name', message: 'Ürün adı boş bırakılamaz' })
  }

  if (!data.sku || String(data.sku).trim() === '') {
    errors.push({ field: 'sku', message: 'Ürün kodu (SKU) boş bırakılamaz' })
  }

  if (!data.category || String(data.category).trim() === '') {
    errors.push({ field: 'category', message: 'Kategori seçilmelidir' })
  }

  const retailPrice = parseFloat(String(data.retail_price))
  if (isNaN(retailPrice) || String(data.retail_price).trim() === '') {
    errors.push({ field: 'retail_price', message: 'Perakende fiyatı boş bırakılamaz' })
  } else if (retailPrice < 0) {
    errors.push({ field: 'retail_price', message: 'Perakende fiyatı negatif olamaz' })
  }

  const wholesalePrice = parseFloat(String(data.wholesale_price))
  if (isNaN(wholesalePrice) || String(data.wholesale_price).trim() === '') {
    errors.push({ field: 'wholesale_price', message: 'Toptan fiyatı boş bırakılamaz' })
  } else if (wholesalePrice < 0) {
    errors.push({ field: 'wholesale_price', message: 'Toptan fiyatı negatif olamaz' })
  }

  return errors
}

export function validatePriceForm(data: {
  retail_price: string | number
  wholesale_price: string | number
}): ValidationError[] {
  const errors: ValidationError[] = []

  const retailPrice = parseFloat(String(data.retail_price))
  if (isNaN(retailPrice) || String(data.retail_price).trim() === '') {
    errors.push({ field: 'retail_price', message: 'Perakende fiyatı boş bırakılamaz' })
  } else if (retailPrice < 0) {
    errors.push({ field: 'retail_price', message: 'Perakende fiyatı negatif olamaz' })
  }

  const wholesalePrice = parseFloat(String(data.wholesale_price))
  if (isNaN(wholesalePrice) || String(data.wholesale_price).trim() === '') {
    errors.push({ field: 'wholesale_price', message: 'Toptan fiyatı boş bırakılamaz' })
  } else if (wholesalePrice < 0) {
    errors.push({ field: 'wholesale_price', message: 'Toptan fiyatı negatif olamaz' })
  }

  return errors
}
