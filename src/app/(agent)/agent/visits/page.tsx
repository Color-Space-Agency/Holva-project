import { Suspense } from 'react'
import { AgentVisits } from '@/components/agent/agent-visits'

export default function AgentVisitsPage() {
  return (
    <Suspense fallback={<div className="p-4">Yuklanmoqda...</div>}>
      <AgentVisits />
    </Suspense>
  )
}
