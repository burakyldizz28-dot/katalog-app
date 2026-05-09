import { Suspense } from 'react'
import { OrdersClient } from './OrdersClient'

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Yükleniyor...</div>}>
        <OrdersClient />
      </Suspense>
    </div>
  )
}