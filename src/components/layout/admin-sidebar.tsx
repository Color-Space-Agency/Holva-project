"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Warehouse,
  Factory,
  Store,
  ShoppingCart,
  Truck,
  Users,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Boxes,
  ClipboardList,
  UserCheck,
  Banknote,
  ChevronDown,
  X,
  FileCheck2,
  Receipt,
} from "lucide-react"
import { LogoutDialog } from "@/components/shared/logout-dialog"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  roles?: string[]
  badge?: number
}

const navItems: NavItem[] = [
  {
    label: "Boshqaruv paneli",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mahsulotlar",
    href: "/products",
    icon: Package,
  },
  {
    label: "Ombor",
    href: "/warehouse",
    icon: Warehouse,
  },
  {
    label: "Sotuv bo'limi",
    icon: ShoppingCart,
    children: [
      { label: "Sotuvlar", href: "/orders", icon: ShoppingCart },
      { label: "Mijozlar (Do'konlar)", href: "/stores", icon: Truck },
      { label: "Akt Sverka", href: "/akt-sverka", icon: FileCheck2 },
    ],
  },
  {
    label: "Ishxona (HR)",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { label: "Ishchilar", href: "/hr/employees", icon: Users },
      { label: "Ish haqi", href: "/hr/salary", icon: Banknote },
    ],
  },
  {
    label: "Moliya",
    icon: Banknote,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    children: [
      { label: "Kassa", href: "/finance/cash", icon: Banknote },
      { label: "Kirim", href: "/finance/income", icon: TrendingUp },
      { label: "Chiqim", href: "/finance/expenses", icon: Banknote },
      { label: "Sotuv to'lovlari", href: "/finance/payments", icon: Receipt },
    ],
  },
  {
    label: "Analitika",
    href: "/analytics",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Hisobotlar",
    href: "/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  },
  {
    label: "Bildirishnomalar",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Sozlamalar",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
]

interface AdminSidebarProps {
  profile: Profile | null
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function AdminSidebar({ profile, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [logoutOpen, setLogoutOpen] = useState(false)

  // Auto-expand active group
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((child) =>
          child.href ? pathname.startsWith(child.href) : false
        )
        if (hasActive) {
          setExpandedGroups((prev) =>
            prev.includes(item.label) ? prev : [...prev, item.label]
          )
        }
      }
    })
  }, [pathname])

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    )
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!profile?.role) return false
    return item.roles.includes(profile.role)
  })

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Holva Factory
              </p>
              <p className="text-[11px] text-gray-400 truncate">Super Admin CRM</p>
            </div>
          </div>
        )}

        {collapsed && !isMobile && (
          <div className="w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm mx-auto">
            <span className="text-sm font-bold text-white">H</span>
          </div>
        )}

        {!isMobile && !collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredNavItems.map((item) => {
          if (item.children) {
            const isExpanded = isMobile || expandedGroups.includes(item.label)
            const hasActive = item.children.some((child) =>
              child.href ? pathname.startsWith(child.href) : false
            )

            return (
              <div key={item.label}>
                <button
                  onClick={() => (!collapsed || isMobile) && toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left",
                    hasActive
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    collapsed && !isMobile && "justify-center px-2"
                  )}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "flex-shrink-0",
                      hasActive ? "text-amber-600 dark:text-amber-400" : "text-gray-400"
                    )}
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200 text-gray-400",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {(!collapsed || isMobile) && isExpanded && (
                  <div className="ml-4 pl-3 border-l border-gray-100 dark:border-gray-800 space-y-0.5 my-1">
                    {item.children.map((child) => {
                      const isActive = child.href ? pathname.startsWith(child.href) : false
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          onClick={onCloseMobile}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                            isActive
                              ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-semibold"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/30"
                          )}
                        >
                          <child.icon size={14} className="flex-shrink-0" />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = item.href ? pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) : false

          return (
            <Link
              key={item.href || item.label}
              href={item.href!}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50",
                collapsed && !isMobile && "justify-center px-2"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon
                size={18}
                className={cn("flex-shrink-0", isActive ? "text-white" : "text-gray-400")}
              />
              {(!collapsed || isMobile) && <span className="flex-1 truncate">{item.label}</span>}
              {(!collapsed || isMobile) && item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Chiqish */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        {!isMobile && collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-1"
          >
            <ChevronRight size={16} />
          </button>
        )}
        <button
          onClick={() => setLogoutOpen(true)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-150 cursor-pointer",
            collapsed && !isMobile && "justify-center"
          )}
          title={collapsed && !isMobile ? "Chiqish" : undefined}
        >
          <LogOut size={18} />
          {(!collapsed || isMobile) && "Chiqish"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (lg va undan katta ekranlar) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 z-20",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobil & Planshet Slide-over Drawer (lg dan kichik ekranlar) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur overlay */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}

      {/* Logout confirmation dialog */}
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  )
}
