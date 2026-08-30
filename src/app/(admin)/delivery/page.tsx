import { DeliveriesClient } from "@/components/delivery/deliveries-client"

export const metadata = {
  title: "Yetkazmalar",
}

export default function DeliveriesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Yetkazmalar</h2>
      </div>
      <DeliveriesClient />
    </div>
  )
}
