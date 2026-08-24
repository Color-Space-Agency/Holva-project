import { StoresClient } from "@/components/stores/stores-client"

export const metadata = {
  title: "Do'konlar - Holva Factory CRM",
}

export default function StoresPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Do'konlar</h2>
      </div>
      <StoresClient />
    </div>
  )
}
