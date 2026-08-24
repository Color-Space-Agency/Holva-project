'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Phone, MapPin, User, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AgentStoreDetail({ storeId }: { storeId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data } = await supabase.from('stores').select('*').eq('id', storeId).single();
      return data;
    }
  });

  const { data: orders } = useQuery({
    queryKey: ['store-orders', storeId],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(10);
      return data || [];
    }
  });

  if (isLoading) return <div className="p-4 animate-pulse"><div className="h-40 bg-muted rounded-lg"></div></div>;
  if (!store) return <div className="p-4 text-center">Do'kon topilmadi</div>;

  return (
    <div className="relative min-h-screen pb-20">
      <div className="bg-primary text-primary-foreground p-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/50" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold truncate">{store.name}</h1>
        </div>
        
        <div className="bg-background/10 rounded-lg p-4">
          <div className="text-sm opacity-80 mb-1">Joriy balans</div>
          <div className="text-3xl font-bold">
            {formatCurrency(Number(store.current_balance))}
          </div>
          {Number(store.current_balance) < 0 && (
            <div className="text-sm mt-1 text-red-200">Qarzdorlik mavjud</div>
          )}
        </div>
      </div>

      <div className="p-4 -mt-4">
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-auto p-0">
                <TabsTrigger value="info" className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">Ma'lumot</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">Buyurtmalar</TabsTrigger>
                <TabsTrigger value="visits" className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">Tashriflar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="p-4 space-y-4">
                {store.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Telefon</div>
                      <a href={`tel:${store.phone}`} className="font-medium text-primary">{store.phone}</a>
                    </div>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Manzil</div>
                      <div className="font-medium">{store.address}</div>
                    </div>
                  </div>
                )}
                {store.contact_person && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Mas'ul shaxs</div>
                      <div className="font-medium">{store.contact_person}</div>
                    </div>
                  </div>
                )}
                {store.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Eslatmalar</div>
                      <div className="font-medium">{store.notes}</div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="p-4 space-y-3">
                {orders?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Buyurtmalar yo'q</div>
                ) : (
                  orders?.map(order => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(Number(order.total_amount))}</div>
                        <div className="text-xs bg-muted px-2 py-0.5 rounded-full inline-block mt-1">{order.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="visits" className="p-4 text-center text-muted-foreground py-8">
                Tez orada ishga tushadi
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-20 right-4">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
          <Link href={`/orders?new=true&store=${storeId}`}>
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
