import { OrdersClient } from "@/components/orders/orders-client"
import { BackButton } from "@/components/shared/back-button"

export const metadata = {
  title: "Sotuv bo'limi",
}

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Sotuv bo&apos;limi</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Barcha sotuvlar, agentlar savdosi, qarzdorlik va to&apos;lovlar hisob-kitobi
          </p>
        </div>
      </div>
      <OrdersClient />
    </div>
  )
}
