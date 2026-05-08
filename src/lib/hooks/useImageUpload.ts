'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Upload timeout süresi (ms)
const UPLOAD_TIMEOUT_MS = 15_000

interface UploadResult {
  url: string | null
  error: string | null
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const supabase = createClient()

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      console.log('[Upload] Upload başladı, dosya:', file.name, 'boyut:', file.size)
      setUploading(true)
      setUploadError(null)

      try {
        // Dosya boyutu kontrolü (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          const err = 'Görsel boyutu 5MB\'dan büyük olamaz'
          console.warn('[Upload] Boyut hatası:', err)
          setUploadError(err)
          return { url: null, error: err }
        }

        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          const err = 'Sadece JPEG, PNG veya WebP görseller yüklenebilir'
          console.warn('[Upload] Tip hatası:', err)
          setUploadError(err)
          return { url: null, error: err }
        }

        // Benzersiz dosya adı
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const filePath = `products/${fileName}`

        // Upload with timeout
        const uploadPromise = supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('UPLOAD_TIMEOUT')), UPLOAD_TIMEOUT_MS)
        })

        let uploadResult
        try {
          uploadResult = await Promise.race([uploadPromise, timeoutPromise])
        } catch (raceErr) {
          if (raceErr instanceof Error && raceErr.message === 'UPLOAD_TIMEOUT') {
            const err = 'Görsel yükleme zaman aşımına uğradı (15sn). Tekrar deneyin.'
            console.error('[Upload] Timeout hatası')
            setUploadError(err)
            return { url: null, error: err }
          }
          throw raceErr
        }

        // TypeScript: uploadResult kesin uploadPromise sonucu
        const { error: uploadErr } = uploadResult as Awaited<typeof uploadPromise>

        if (uploadErr) {
          console.error('[Upload] Supabase Storage hatası:', uploadErr)
          const err = `Görsel yüklenirken hata oluştu: ${uploadErr.message}`
          setUploadError(err)
          return { url: null, error: err }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(filePath)

        console.log('[Upload] Upload bitti, URL:', publicUrl)
        return { url: publicUrl, error: null }
      } catch (catchErr) {
        console.error('[Upload] Beklenmedik hata:', catchErr)
        const err = catchErr instanceof Error
          ? `Görsel yükleme hatası: ${catchErr.message}`
          : 'Beklenmedik bir hata oluştu'
        setUploadError(err)
        return { url: null, error: err }
      } finally {
        // ⚡ Her durumda uploading state'i kapat
        console.log('[Upload] Upload state sıfırlandı')
        setUploading(false)
      }
    },
    [supabase]
  )

  // F5 veya sayfa yenilemede state zaten sıfır başlıyor (useState(false))
  const removeUploadError = () => setUploadError(null)

  return { uploadImage, uploading, uploadError, removeUploadError }
}
