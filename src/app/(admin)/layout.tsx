import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { AdminShell } from "@/components/layout/admin-shell"
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

  return <AdminShell profile={profile}>{children}</AdminShell>
}
