'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { AgentOrderForm } from './agent-order-form';
import { useSearchParams } from 'next/navigation';

export function AgentOrders() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['agent-orders', userId, filter],
    enabled: !!userId,
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at, stores (name)')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (filter !== 'ALL') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      return data || [];
    }
  });

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
        <h1 className="text-xl font-bold mb-4">Buyurtmalarim</h1>
        
        <Tabs value={filter} onValueChange={setFilter} className="w-full overflow-x-auto">
          <TabsList className="w-max inline-flex">
            <TabsTrigger value="ALL">Barchasi</TabsTrigger>
            <TabsTrigger value="DRAFT">Qoralama</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Tasdiqlangan</TabsTrigger>
            <TabsTrigger value="DELIVERED">Yetkazilgan</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)
        ) : orders?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Buyurtmalar topilmadi</div>
        ) : (
          orders?.map(order => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{(order.stores as any)?.name}</div>
                    <div className="text-sm text-muted-foreground">{order.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(Number(order.total_amount))}</div>
                    <div className="text-xs bg-muted px-2 py-0.5 rounded-full inline-block mt-1">{order.status}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString('uz-UZ')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AgentOrderForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        userId={userId || ''} 
      />

      <button 
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
