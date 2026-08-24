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
} from "lucide-react"
import { cn } from "@/lib/utils"
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
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          const label = breadcrumbMap[seg] || seg
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span
                className={cn(
                  "truncate",
                  isLast
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                {label}
              </span>
            </span>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
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

        {/* Profile */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
              {profile?.full_name || "Foydalanuvchi"}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {roleLabels[profile?.role || ""] || profile?.role}
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}
