import { OrderDetailClient } from "@/components/orders/order-detail-client"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Buyurtma - Holva Factory CRM",
}

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Buyurtma ma'lumotlari</h2>
      </div>
      <OrderDetailClient orderId={params.id} />
    </div>
  )
}
