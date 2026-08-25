"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Store, Package, Settings } from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Bosh sahifa", href: "/dashboard" },
  { icon: ShoppingCart, label: "Buyurtmalar", href: "/orders" },
  { icon: Store, label: "Do'konlar", href: "/stores" },
  { icon: Package, label: "Mahsulotlar", href: "/products" },
  { icon: Settings, label: "Sozlamalar", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-40 lg:hidden safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200
                ${isActive ? "text-violet-600 dark:text-violet-400 font-bold scale-105" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}
                touch-friendly active:scale-95
              `}
            >
              <div className={`p-1 rounded-xl ${isActive ? "bg-violet-50 dark:bg-violet-950/50" : ""}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNav;
