"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, ShoppingCart, MapPin, User, LogOut } from "lucide-react"
import { useState } from "react"
import { LogoutDialog } from "@/components/shared/logout-dialog"

const agentNavItems = [
  { label: "Asosiy", href: "/agent/home", icon: Home },
  { label: "Do'konlar", href: "/agent/stores", icon: Store },
  { label: "Sotuv", href: "/agent/orders", icon: ShoppingCart },
  { label: "Tashriflar", href: "/agent/visits", icon: MapPin },
  { label: "Profil", href: "/agent/profile", icon: User },
]

export function AgentNav() {
  const pathname = usePathname()
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 h-16 shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50">
        <div className="flex h-full items-center justify-around px-2 max-w-lg mx-auto">
          {agentNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "scale-110 transition-transform" : ""}`} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  )
}
