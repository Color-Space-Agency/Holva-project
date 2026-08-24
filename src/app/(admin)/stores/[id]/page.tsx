import { StoreDetailClient } from "@/components/stores/store-detail-client"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Do'kon ma'lumotlari - Holva Factory CRM",
}

export default async function StoreDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!store) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Do'kon ma'lumotlari</h2>
      </div>
      <StoreDetailClient storeId={params.id} />
    </div>
  )
}
