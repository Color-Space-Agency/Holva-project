import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductsClient } from "@/components/products/products-client"
import { Skeleton } from "@/components/ui/skeleton"
import { BackButton } from "@/components/shared/back-button"

export const metadata: Metadata = { title: "Mahsulotlar" }

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mahsulotlar (Holvalar)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Barcha holva mahsulotlarini boshqaring</p>
        </div>
      </div>
      <Suspense fallback={<div className="grid grid-cols-1 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-24 rounded-2xl"/>)}</div>}>
        <ProductsClient />
      </Suspense>
    </div>
  )
}
