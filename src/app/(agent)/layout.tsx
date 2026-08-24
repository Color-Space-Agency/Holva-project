import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Home, Store, ShoppingCart, MapPin, User } from 'lucide-react'
import { ReactNode } from 'react'

export default async function AgentLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient()
    await supabase.auth.getUser()
  } catch {
    // Graceful fallback
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <main className="flex-1 w-full max-w-lg mx-auto relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 h-16">
        <div className="flex h-full items-center justify-around px-2 max-w-lg mx-auto">
          <Link href="/agent/home" className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Asosiy</span>
          </Link>
          <Link href="/agent/stores" className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <Store className="h-5 w-5" />
            <span className="text-[10px] font-medium">Do&apos;konlar</span>
          </Link>
          <Link href="/agent/orders" className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Buyurtmalar</span>
          </Link>
          <Link href="/agent/visits" className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <MapPin className="h-5 w-5" />
            <span className="text-[10px] font-medium">Tashriflar</span>
          </Link>
          <Link href="/agent/profile" className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
