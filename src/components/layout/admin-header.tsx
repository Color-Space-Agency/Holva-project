"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
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
  X,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutDialog } from "@/components/shared/logout-dialog"
import { AdminChatModal } from "@/components/admin/admin-chat-modal"
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadNotifCount, setUnreadNotifCount] = useState(2)
  const pathname = usePathname()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await fetch("/api/sync/notifications", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (typeof data.unreadCount === "number") {
            setUnreadNotifCount(data.unreadCount)
          }
        }
      } catch {}
    }
    fetchNotifCount()
    const interval = setInterval(fetchNotifCount, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isDark = (resolvedTheme || theme) === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // Build breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbMap: Record<string, string> = {
    dashboard: "Boshqaruv paneli",
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
    orders: "Sotuv bo'limi",
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
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex-shrink-0 transition-colors">
      <div className="h-16 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Chap qism: Gamburger menyu + Logo + Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer touch-friendly"
            aria-label="Menyuni ochish"
          >
            <Menu size={20} />
          </button>

          {/* Mobil brending belgisi */}
          <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-amber-500/20">
              H
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-sm hidden xs:inline">Holva</span>
          </div>

          {/* Breadcrumb (Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-sm min-w-0">
            {segments.map((seg, i) => {
              const label = breadcrumbMap[seg] || seg
              const isLast = i === segments.length - 1
              return (
                <div key={seg} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
                  <span
                    className={cn(
                      "truncate font-medium",
                      isLast
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Desktop Tezkor Qidiruv */}
          <div className="hidden xl:flex items-center bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3.5 py-1.5 border border-gray-100 dark:border-gray-800 text-xs w-64 focus-within:ring-2 focus-within:ring-violet-500 transition-all">
            <Search size={14} className="text-gray-400 flex-shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Qidirish... (Ctrl+K)"
              className="bg-transparent border-none outline-none text-xs w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* O'ng qism: Qidiruv ikonkasi, Bildirishnoma, Tun/Kun, Profil */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Mobil Qidiruv tugmasi */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="xl:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly"
            aria-label="Qidiruv"
          >
            <Search size={18} />
          </button>

          {/* Agentlar bilan Real-time Chat */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors touch-friendly cursor-pointer"
            title="Agentlar bilan aloqa (Chat)"
          >
            <MessageCircle size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </button>

          {/* Bildirishnomalar */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly"
            aria-label="Bildirishnomalar"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </Link>

          {/* Tun / Kun Rejimi */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly"
              aria-label="Mavzuni almashtirish"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          {/* Profil ma'lumotlari */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-violet-500/20">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                {profile?.full_name || "Super Admin"}
              </p>
              <p className="text-[10px] text-gray-400">
                {profile?.role ? roleLabels[profile.role] || profile.role : "Boshqaruvchi"}
              </p>
            </div>
          </div>

          {/* Chiqish tugmasi */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors touch-friendly ml-0.5"
            title="Chiqish"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* Ochiluvchi Mobil Qidiruv Maydoni */}
      {isSearchOpen && (
        <div ref={searchRef} className="px-4 pb-3 animate-fade-in-up border-t border-gray-100 dark:border-gray-800 pt-2 xl:hidden">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-3.5 py-2 border border-gray-100 dark:border-gray-700">
            <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Mahsulot, do'kon yoki buyurtma qidirish..."
              className="bg-transparent border-none outline-none text-xs w-full text-gray-800 dark:text-gray-100 placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
      
      {/* Super Admin Agent Chat Modali */}
      <AdminChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  )
}
