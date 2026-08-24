import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Holva CRM",
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Worker gets redirected to worker view
  if (profile?.role === "WORKER") {
    redirect("/worker")
  }

  // Sales agent gets redirected to agent view
  if (profile?.role === "SALES_AGENT") {
    redirect("/agent")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AdminSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
