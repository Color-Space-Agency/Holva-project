"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import type { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AdminShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function AdminShell({ profile, children }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar (Desktop va Mobil Drawer) */}
      <AdminSidebar
        profile={profile}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Asosiy kontent maydoni */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with hamburger toggle */}
        <AdminHeader
          profile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Sahifa ichki kontenti */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
