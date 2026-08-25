import { ReactNode } from 'react'
import { AgentNav } from '@/components/agent/agent-nav'
import { isRealSupabaseConfigured } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/server'

export default async function AgentLayout({ children }: { children: ReactNode }) {
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.auth.getUser()
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-20">
      <main className="flex-1 w-full max-w-lg mx-auto relative">
        {children}
      </main>
      <AgentNav />
    </div>
  )
}
