import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { isRealSupabaseConfigured } from "@/lib/mock-data"

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
  const cookieStore = await cookies()
  const demoRole = cookieStore.get("demo_session")?.value

  let profile: any = {
    id: "demo-admin-id",
    full_name: "Super Admin",
    role: demoRole === "SALES_AGENT" ? "SALES_AGENT" : "SUPER_ADMIN",
    email: "admin@holva.uz",
  }

  if (isRealSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (dbProfile) {
          profile = dbProfile
        }
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar profile={profile} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <AdminHeader profile={profile} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
