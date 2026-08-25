'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Store, CreditCard, ChevronRight, Plus, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { INITIAL_ORDERS, INITIAL_STORES } from '@/lib/mock-data';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';

export function AgentHome() {
  const [userName, setUserName] = useState<string>('Sardor Rahimov');

  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName);
  }, []);

  const stats = {
    todayOrders: 6,
    todaySales: 22400000,
    todayVisits: 9,
    assignedStores: INITIAL_STORES.length,
    commission: {
      commission_amount: 4725000,
      paid_amount: 3500000,
      remaining_amount: 1225000,
    },
  };

  const recentOrders = INITIAL_ORDERS.slice(0, 4);
  const currentDate = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'full' }).format(new Date());

  return (
    <div className="p-4 space-y-5 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Savdo Agenti Paneli
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
            Salom, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-gray-400 capitalize">{currentDate}</p>
        </div>
        <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-base border border-emerald-200/50">
          SR
        </div>
      </div>

      {/* Tezkor harakat tugmalari */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/agent/orders?new=true" className="w-full">
          <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold gap-2 shadow-md shadow-emerald-500/20 cursor-pointer">
            <Plus className="h-4 w-4" /> Yangi Buyurtma
          </Button>
        </Link>
        <Link href="/agent/visits" className="w-full">
          <Button variant="outline" className="w-full h-12 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl text-xs font-bold gap-2 cursor-pointer">
            <MapPin className="h-4 w-4 text-emerald-600" /> Tashrif Qayd Etish
          </Button>
        </Link>
      </div>

      {/* Kunlik KPI Ko'rsatkichlari */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase">Bugungi Savdo</span>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.todaySales)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Rejadan 118% ortiq</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase">Buyurtmalar</span>
            <ShoppingCart className="h-4 w-4 text-violet-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.todayOrders} ta
          </div>
          <span className="text-[10px] text-gray-400">Barchasi qabul qilindi</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase">Tashriflar</span>
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.todayVisits} ta do&apos;kon
          </div>
          <span className="text-[10px] text-blue-600 font-medium">9 / 12 reja bajarildi</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase">Do&apos;konlarim</span>
            <Store className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.assignedStores} ta
          </div>
          <span className="text-[10px] text-gray-400">Biriktirilgan nuqtalar</span>
        </div>
      </div>

      {/* Oylik Komissiya Bloki */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-violet-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-violet-200 uppercase tracking-wider">
            Oylik Komissiya & Bonus
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-300" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(stats.commission.commission_amount)}</div>
            <div className="text-xs text-violet-200 mt-0.5">
              To&apos;langan: {formatCurrency(stats.commission.paid_amount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-violet-200">Qoldiq olishingiz kerak:</span>
            <div className="text-sm font-bold text-emerald-300">
              {formatCurrency(stats.commission.remaining_amount)}
            </div>
          </div>
        </div>
      </div>

      {/* Oxirgi Buyurtmalar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Oxirgi Buyurtmalarim</h2>
          <Link href="/agent/orders" className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 hover:underline">
            Barchasi <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-emerald-200 transition-all shadow-sm"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {order.store_name}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="font-mono text-violet-600">{order.order_number}</span>
                  <span>•</span>
                  <span>{new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 space-y-1">
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
