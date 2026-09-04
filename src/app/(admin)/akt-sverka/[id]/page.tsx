import { AktSverkaDetailClient } from "@/components/finance/akt-sverka-detail-client"

export const metadata = {
  title: "Akt Sverka Batafsil",
}

export default async function AktSverkaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AktSverkaDetailClient storeId={resolvedParams.id} />
    </div>
  )
}
