import { StoreDetailClient } from "@/components/stores/store-detail-client"
import { isRealSupabaseConfigured } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/shared/back-button"

export const metadata = {
  title: "Do'kon ma'lumotlari",
}

export default async function StoreDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  if (isRealSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("id", params.id)
        .single()
    } catch {
      // Fallback
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-3">
        <BackButton href="/stores" />
        <h2 className="text-3xl font-bold tracking-tight">Do&apos;kon ma&apos;lumotlari</h2>
      </div>
      <StoreDetailClient storeId={params.id} />
    </div>
  )
}
