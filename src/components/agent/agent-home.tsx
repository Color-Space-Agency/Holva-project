'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, Store, Users, 
  Phone, ChevronRight, CheckCircle, Clock, 
  Truck, Package, CircleDollarSign, Plus, MapPin 
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { INITIAL_ORDERS, INITIAL_STORES } from '@/lib/mock-data';

export function AgentHome() {
  const [userName, setUserName] = useState<string>('Sardor');

  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);
  }, []);

  // Agent ma'lumotlari
  const agentData = {
    name: userName,
    todayRevenue: 22400000,
    revenuePercent: 118,
    orders: 6,
    visits: 9,
    visitPlan: 12,
    stores: INITIAL_STORES.length,
    commission: 4725000,
    commissionPaid: 3500000,
    commissionRemaining: 1225000,
    ordersList: [
      { id: 'HLV-2026-00104', client: 'Korzinka — Chilonzor', time: '05:21', phone: '+998 71 140 14 14', amount: 14800000, status: 'delivered' },
      { id: 'HLV-2026-00105', client: 'Makro Supermarket — Sergeli', time: '00:21', phone: '+998 71 205 12 22', amount: 9200000, status: 'accepted' },
      { id: 'HLV-2026-00106', client: 'Havas Diskaunter — Qo\'yliq', time: '11:21', phone: '+998 71 200 00 07', amount: 21500000, status: 'shipping' },
      { id: 'HLV-2026-00107', client: 'Baraka Qandolat Do\'koni', time: '03:21', phone: '+998 90 987 65 43', amount: 4600000, status: 'ready' },
    ]
  };

  // Status konfiguratsiyalari
  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    delivered: { label: 'Yetkazib berildi', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    accepted: { label: 'Qabul qilindi', icon: Clock, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    shipping: { label: 'Yetkazilmoqda', icon: Truck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    ready: { label: 'Tayyor (Omborda)', icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in-up max-w-lg mx-auto p-4">
      
      {/* 1. Salomlashuv qismi */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Salom, <span className="text-amber-600 dark:text-amber-400">{agentData.name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 capitalize">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/agent/profile">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition touch-press cursor-pointer border border-amber-200/50">
            <Users className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Tezkor tugmalar */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/agent/orders?new=true" className="w-full">
          <button className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl text-xs font-bold gap-2 flex items-center justify-center shadow-md shadow-amber-500/20 cursor-pointer touch-friendly active:scale-95">
            <Plus className="h-4 w-4" /> Yangi Buyurtma
          </button>
        </Link>
        <Link href="/agent/visits" className="w-full">
          <button className="w-full h-12 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-2xl text-xs font-bold gap-2 flex items-center justify-center cursor-pointer touch-friendly active:scale-95">
            <MapPin className="h-4 w-4 text-amber-600" /> Tashrif Qayd Etish
          </button>
        </Link>
      </div>

      {/* 2. Asosiy karta - Bugungi Savdo */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-6 border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Bugungi Savdo</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(agentData.todayRevenue)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" />
                Rejadan {agentData.revenuePercent}% ortiq
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <CircleDollarSign className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* 3. Komissiya va progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Oylik Komissiya & Bonus</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(agentData.commission)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{formatCurrency(agentData.commissionPaid)}</p>
            <p className="text-[11px] text-gray-400">To&apos;langan</p>
          </div>
        </div>
        
        {/* Progress-bar */}
        <div className="mt-3.5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span>Qoldiq: {formatCurrency(agentData.commissionRemaining)}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{(agentData.commissionPaid / agentData.commission * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
              style={{ width: `${(agentData.commissionPaid / agentData.commission * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Metrikalar tarmog'i (2 ustun) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{agentData.orders} ta</p>
              <p className="text-xs text-gray-400">Buyurtmalar</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Barchasi qabul qilindi
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl">
              <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{agentData.visits} ta</p>
              <p className="text-xs text-gray-400">Tashriflar</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-2.5 flex items-center gap-1">
            {agentData.visits} / {agentData.visitPlan} reja bajarildi
          </p>
        </div>
      </div>

      {/* 5. Buyurtmalar ro'yxati (Messenger uslubida) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Oxirgi Buyurtmalarim</h2>
          <Link href="/agent/orders" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition touch-press">
            Barchasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {agentData.ordersList.map((order) => {
            const status = statusConfig[order.status] || statusConfig.delivered;
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition-all touch-press active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {order.client}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-gray-400">{order.id}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(order.amount)}</p>
                    <span className={`
                      inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1
                      ${status.color}
                    `}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
                
                {/* Tezkor qo'ng'iroq / Bog'lanish tugmasi */}
                <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                  <a
                    href={`tel:${order.phone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 touch-friendly"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Bog&apos;lanish
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}

export default AgentHome;
