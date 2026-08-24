import { Suspense } from 'react'
import { AgentOrders } from '@/components/agent/agent-orders'

export default function AgentOrdersPage() {
  return (
    <Suspense fallback={<div className="p-4">Yuklanmoqda...</div>}>
      <AgentOrders />
    </Suspense>
  )
}
