import { AgentStoreDetail } from '@/components/agent/agent-store-detail';

export default async function AgentStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentStoreDetail storeId={id} />;
}
