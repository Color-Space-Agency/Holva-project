'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Phone, MapPin, User, FileText, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_STORES, INITIAL_ORDERS, isRealSupabaseConfigured } from '@/lib/mock-data';

export function AgentStoreDetail({ storeId }: { storeId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('stores').select('*').eq('id', storeId).single();
          if (data) return data;
        } catch {
          // Fallback
        }
      }
      return INITIAL_STORES.find(s => s.id === storeId) || INITIAL_STORES[0];
    }
  });

  const { data: orders } = useQuery({
    queryKey: ['store-orders', storeId],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(10);
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return INITIAL_ORDERS.filter(o => o.store_name === store?.name || true).slice(0, 5);
    }
  });

  if (isLoading) return <div className="p-4 animate-pulse"><div className="h-40 bg-muted rounded-2xl"></div></div>;
  if (!store) return <div className="p-4 text-center">Do&apos;kon topilmadi</div>;

  const hasDebt = Number(store.current_balance) < 0;

  return (
    <div className="relative min-h-screen pb-24 max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 pt-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold truncate">{store.name}</h1>
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
          <div className="text-xs text-emerald-100 mb-1 font-medium">Joriy balans / Qarzdorlik</div>
          <div className="text-2xl font-bold">
            {formatCurrency(Math.abs(Number(store.current_balance)))}
          </div>
          {hasDebt ? (
            <div className="text-xs mt-1 text-red-200 font-semibold">⚠️ Qarzdorlik mavjud</div>
          ) : (
            <div className="text-xs mt-1 text-emerald-200 font-semibold">✓ Hisobda qarz yo&apos;q</div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="rounded-3xl border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Mas&apos;ul shaxs</div>
                <div className="font-semibold">{store.contact_person || 'Mavjud emas'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Phone className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-xs text-gray-400">Telefon</div>
                <a href={`tel:${store.phone}`} className="font-semibold text-emerald-600 hover:underline">{store.phone}</a>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <MapPin className="h-4 w-4 text-violet-600" />
              <div>
                <div className="text-xs text-gray-400">Manzil</div>
                <div className="font-semibold">{store.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sotuvlar tarixi */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Oxirgi Sotuvlar</h2>
            <Link href={`/agent/orders?new=true&store=${store.id}`}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1 h-8">
                <Plus className="h-3.5 w-3.5" /> Sotuv olish
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {orders?.map((ord: any) => (
              <div key={ord.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-violet-600">{ord.order_number}</span>
                  <div className="text-gray-400 mt-0.5">{new Date(ord.created_at).toLocaleDateString('uz-UZ')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(ord.total_amount)}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
