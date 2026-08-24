import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
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
  let profile: any = {
    id: "demo-admin-id",
    full_name: "Admin Boshqaruvchi",
    role: "SUPER_ADMIN",
    email: "admin@holva.uz",
  }

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
    } else {
      // Check cookie for demo session
      const cookieStore = await cookies()
      const demoRole = cookieStore.get("demo_session")?.value
      if (demoRole === "SALES_AGENT") {
        profile = {
          id: "demo-agent-id",
          full_name: "Sardor Rahimov",
          role: "SALES_AGENT",
          email: "agent@holva.uz",
        }
      }
    }
  } catch {
    // Fallback gracefully to demo admin
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
