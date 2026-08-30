import { AktSverkaDetailClient } from "@/components/finance/akt-sverka-detail-client"
import { INITIAL_STORES } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Akt Sverka Batafsil - Holva Factory CRM",
}

export default async function AktSverkaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const store = INITIAL_STORES.find(s => s.id === resolvedParams.id)
  
  if (!store) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Akt Sverka: {store.name}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Mijoz bilan oldi-berdi va to'lovlar tarixini batafsil ko'rish va tahrirlash.
        </p>
      </div>

      <AktSverkaDetailClient store={store} />
    </div>
  )
}
