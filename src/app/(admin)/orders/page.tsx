import { OrdersClient } from "@/components/orders/orders-client"

export const metadata = {
  title: "Buyurtmalar - Holva Factory CRM",
}

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Buyurtmalar</h2>
      </div>
      <OrdersClient />
    </div>
  )
}
