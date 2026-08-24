import type { Metadata } from "next"
import { Suspense } from "react"
import { RawMaterialsClient } from "@/components/raw-materials/raw-materials-client"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Xomashyo" }

export default function RawMaterialsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xomashyo</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Xomashyo zaxiralarini boshqaring</p>
      </div>
      <Suspense fallback={<div className="space-y-4">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-16 rounded-2xl"/>)}</div>}>
        <RawMaterialsClient />
      </Suspense>
    </div>
  )
}
