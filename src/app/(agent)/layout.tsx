import { createClient } from '@/lib/supabase/server'
import { ReactNode } from 'react'
import { AgentNav } from '@/components/agent/agent-nav'

export default async function AgentLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient()
    await supabase.auth.getUser()
  } catch {
    // Graceful fallback
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
