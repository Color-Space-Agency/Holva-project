'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingCart, Search, CheckCircle2, Clock, Truck, Store, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_STORES } from '@/lib/mock-data';
import { AgentOrderForm } from './agent-order-form';

export function AgentOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.store_name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOrderCreated = (newOrder: any) => {
    setOrders([newOrder, ...orders]);
    setIsFormOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Yetkazildi
          </span>
        );
      case 'DELIVERING':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Truck className="h-3 w-3" /> Yetkazilmoqda
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 dark:bg-violet-950 dark:text-violet-300 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> Qabul qilindi
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur py-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/agent/home')}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-all cursor-pointer shadow-sm"
              title="Bosh sahifaga qaytish"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtmalarim</h1>
              <p className="text-xs text-gray-400">Jami {filteredOrders.length} ta buyurtma</p>
            </div>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" /> Yangi olish
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buyurtma # yoki do'kon nomi..."
            className="pl-10 h-11 rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl p-1 h-10">
            <TabsTrigger value="ALL" className="text-xs rounded-xl">Barchasi</TabsTrigger>
            <TabsTrigger value="CONFIRMED" className="text-xs rounded-xl">Yangi</TabsTrigger>
            <TabsTrigger value="DELIVERING" className="text-xs rounded-xl">Yo&apos;lda</TabsTrigger>
            <TabsTrigger value="DELIVERED" className="text-xs rounded-xl">Yetkazildi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                  {order.order_number}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mt-0.5 flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-gray-400" />
                  {order.store_name}
                </h3>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
              <span className="text-gray-400">
                {new Date(order.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="text-right">
                <span className="text-gray-400 mr-1.5">Summa:</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            Buyurtmalar topilmadi
          </div>
        )}
      </div>

      {/* Buyurtma Yaratish Modali */}
      <AgentOrderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleOrderCreated}
      />
    </div>
  );
}
