"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sun,
  Moon,
  Bell,
  Search,
  Menu,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutDialog } from "@/components/shared/logout-dialog"
import type { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_AGENT: "Sotuv agenti",
  WAREHOUSE_MANAGER: "Ombor boshqaruvchi",
  PRODUCTION_MANAGER: "Ishlab chiqarish boshqaruvchi",
  ACCOUNTANT: "Buxgalter",
  WORKER: "Ishchi",
}

interface AdminHeaderProps {
  profile: Profile | null
  onToggleMobileSidebar?: () => void
}

export function AdminHeader({ profile, onToggleMobileSidebar }: AdminHeaderProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const isDark = (resolvedTheme || theme) === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // Build breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Mahsulotlar",
    categories: "Kategoriyalar",
    recipes: "Retseptlar",
    "raw-materials": "Xomashyo",
    suppliers: "Ta'minotchilar",
    warehouse: "Ombor",
    movements: "Harakatlar",
    adjustments: "Moslash",
    production: "Ishlab chiqarish",
    planning: "Rejalashtirish",
    stores: "Do'konlar",
    orders: "Buyurtmalar",
    delivery: "Yetkazib berish",
    hr: "Ishxona",
    employees: "Ishchilar",
    departments: "Bo'limlar",
    attendance: "Keldi-ketti",
    performance: "Samaradorlik",
    salary: "Ish haqi",
    finance: "Moliya",
    cash: "Kassa",
    income: "Daromadlar",
    expenses: "Xarajatlar",
    payments: "To'lovlar",
    analytics: "Analitika",
    reports: "Hisobotlar",
    notifications: "Bildirishnomalar",
    settings: "Sozlamalar",
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 sticky top-0 z-30">
      {/* Mobil Gamburger Menyu Tugmasi (lg:hidden) */}
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Menyuni ochish"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          const label = breadcrumbMap[seg] || seg
          return (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span
                className={cn(
                  "truncate text-xs sm:text-sm",
                  isLast
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-400 dark:text-gray-500 hidden sm:inline"
                )}
              >
                {label}
              </span>
            </span>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dark / Light mode toggle */}
        {mounted && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            title={isDark ? "Yorug' rejim (Light mode)" : "Tungi rejim (Dark mode)"}
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-violet-600" />}
          </button>
        )}

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Bell size={18} />
          {/* Unread badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </Link>

        {/* Logout Quick Button */}
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all cursor-pointer"
          title="Tizimdan chiqish"
        >
          <LogOut size={18} />
        </button>

        {/* Profile Avatar / Name */}
        <Link
          href="/settings"
          className="flex items-center gap-2 sm:pl-2 sm:pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {profile?.full_name || "Super Admin"}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              {roleLabels[profile?.role || ""] || "Super Admin"}
            </p>
          </div>
        </Link>
      </div>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </header>
  )
}
