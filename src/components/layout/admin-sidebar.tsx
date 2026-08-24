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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mahsulotlar",
    icon: Package,
    children: [
      { label: "Holvalar", href: "/products", icon: Package },
      { label: "Kategoriyalar", href: "/products/categories", icon: Boxes },
    ],
  },
  {
    label: "Retseptlar",
    href: "/recipes",
    icon: FlaskConical,
  },
  {
    label: "Xomashyo",
    icon: Boxes,
    children: [
      { label: "Xomashyolar", href: "/raw-materials", icon: Boxes },
      { label: "Ta'minotchilar", href: "/raw-materials/suppliers", icon: Truck },
    ],
  },
  {
    label: "Ombor",
    icon: Warehouse,
    roles: ["SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER"],
    children: [
      { label: "Inventar", href: "/warehouse", icon: Warehouse },
      { label: "Harakatlar", href: "/warehouse/movements", icon: ClipboardList },
      { label: "Moslash", href: "/warehouse/adjustments", icon: ClipboardList },
    ],
  },
  {
    label: "Ishlab chiqarish",
    icon: Factory,
    roles: ["SUPER_ADMIN", "ADMIN", "PRODUCTION_MANAGER"],
    children: [
      { label: "Batchlar", href: "/production", icon: Factory },
      { label: "Rejalashtirish", href: "/production/planning", icon: CalendarCheck },
    ],
  },
  {
    label: "Do'konlar",
    href: "/stores",
    icon: Store,
  },
  {
    label: "Buyurtmalar",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Yetkazib berish",
    href: "/delivery",
    icon: Truck,
  },
  {
    label: "Ishxona (HR)",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { label: "Ishchilar", href: "/hr/employees", icon: Users },
      { label: "Bo'limlar", href: "/hr/departments", icon: Boxes },
      { label: "Keldi-ketti", href: "/hr/attendance", icon: UserCheck },
      { label: "Samaradorlik", href: "/hr/performance", icon: TrendingUp },
      { label: "Ish haqi", href: "/hr/salary", icon: Banknote },
    ],
  },
  {
    label: "Moliya",
    icon: DollarSign,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    children: [
      { label: "Kassa", href: "/finance/cash", icon: Banknote },
      { label: "Daromadlar", href: "/finance/income", icon: TrendingUp },
      { label: "Xarajatlar", href: "/finance/expenses", icon: DollarSign },
      { label: "To'lovlar", href: "/finance/payments", icon: DollarSign },
    ],
  },
  {
    label: "Analitika",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Hisobotlar",
    href: "/reports",
    icon: FileText,
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
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Tizimdan chiqildi")
    router.push("/login")
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!profile?.role) return false
    return item.roles.includes(profile.role)
  })

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 z-20",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">H</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Holva CRM
                </p>
                <p className="text-xs text-gray-400 truncate">Factory</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm mx-auto">
              <span className="text-sm font-bold text-white">H</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filteredNavItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.label)
              const hasActive = item.children.some((child) =>
                child.href ? pathname.startsWith(child.href) : false
              )

              return (
                <div key={item.label}>
                  <button
                    onClick={() => !collapsed && toggleGroup(item.label)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                      hasActive
                        ? "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>

                  {!collapsed && isExpanded && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-gray-100 dark:border-gray-800 space-y-0.5">
                      {item.children.map((child) => {
                        const isActive = child.href
                          ? pathname === child.href ||
                            (child.href !== "/products" &&
                              pathname.startsWith(child.href))
                          : false
                        return (
                          <Link
                            key={child.href}
                            href={child.href || "#"}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                              isActive
                                ? "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 font-medium"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href
                  ? pathname.startsWith(item.href)
                  : false

            return (
              <Link
                key={item.href}
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {!collapsed ? (
            <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.full_name || "Foydalanuvchi"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {profile?.role?.replace("_", " ") || ""}
              </p>
            </div>
          ) : null}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-1"
            >
              <ChevronRight size={16} />
            </button>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-150",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Chiqish" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && "Chiqish"}
          </button>
        </div>
      </aside>
    </>
  )
}
