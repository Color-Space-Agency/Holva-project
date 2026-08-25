"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Store, Package, Settings } from "lucide-react";
import { useState } from "react";

const items = [
  { icon: LayoutDashboard, label: "Bosh sahifa", href: "/dashboard", activeColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" },
  { icon: ShoppingCart, label: "Buyurtmalar", href: "/orders", activeColor: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40" },
  { icon: Store, label: "Do'konlar", href: "/stores", activeColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" },
  { icon: Package, label: "Mahsulotlar", href: "/products", activeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" },
  { icon: Settings, label: "Sozlamalar", href: "/settings", activeColor: "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-40 lg:hidden safe-bottom bottom-nav-shadow">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActiveTab(item.href)}
              className={`
                flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all duration-200
                touch-friendly relative
                ${isActive ? "scale-105" : "scale-100 opacity-70 hover:opacity-100"}
              `}
            >
              <div
                className={`
                  relative p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? item.activeColor : "text-gray-400 dark:text-gray-500"}
                `}
              >
                <item.icon className="w-5 h-5 transition-transform duration-200" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-600 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
                )}
              </div>
              <span
                className={`
                  text-[10px] mt-0.5 transition-all duration-200 tracking-tight
                  ${isActive ? "font-bold text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNav;
