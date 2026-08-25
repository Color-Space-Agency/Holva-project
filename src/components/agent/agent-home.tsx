'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, Store, Users, 
  Phone, ChevronRight, CheckCircle, Clock, 
  Truck, Package, CircleDollarSign, 
  Star, Zap, MessageCircle, BarChart3,
  Eye, EyeOff, Sparkles, ArrowUp, ArrowDown,
  X, Send, Plus, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { INITIAL_STORES } from '@/lib/mock-data';
import { toast } from 'sonner';

// ============================================================
// KOMPONENT: Admin bilan Jonli Chat Modali
// ============================================================
interface ChatMessage {
  id: string;
  sender: 'admin' | 'agent';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'admin', text: 'Assalomu alaykum! Bugungi savdo ajoyib ketmoqda 🔥', time: '10:30' },
  { id: '2', sender: 'agent', text: 'Rahmat! Kunjutli va Yong\'oqli holvalar tez ketyapti 🚀', time: '10:32' },
  { id: '3', sender: 'admin', text: 'Yaxshi, bugungi natijangiz bo\'yicha bonus hisoblaymiz 💰', time: '10:35' },
];

function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const handleSend = () => {
    if (!message.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'agent',
      text: message.trim(),
      time: timeStr,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');

    // Avtomatik admin javobi simulyatsiyasi
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'admin',
          text: 'Qabul qilindi! Buyurtmalar omborga topshirilmoqda 👍',
          time: timeStr,
        },
      ]);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 animate-fade-in">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal oynasi */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-gray-800 slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Super Admin</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Xabarlar lentasi */}
        <div className="p-4 space-y-3 h-72 overflow-y-auto mobile-scroll">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[82%] text-xs sm:text-sm shadow-xs ${
                  msg.sender === 'agent'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'agent' ? 'text-amber-100' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Kiritish maydoni */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Admin bilan bog'lanish..."
              className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl hover:from-amber-700 hover:to-amber-600 transition disabled:opacity-50 touch-press flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONENT: Interaktiv statistika kartochkasi
// ============================================================
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  onClick: () => void;
  isActive: boolean;
}

function StatCard({ icon: Icon, label, value, subtext, color, onClick, isActive }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-4 border-2 transition-all duration-300
        touch-press cursor-pointer active:scale-[0.98]
        ${isActive 
          ? 'border-amber-400 shadow-lg shadow-amber-500/10' 
          : 'border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900/60 hover:shadow-md'
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      <div className="flex items-start gap-3 relative">
        <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
          {subtext && (
            <p className={`text-[11px] mt-1 flex items-center gap-1 truncate ${isActive ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
              {subtext}
            </p>
          )}
        </div>
        {isActive && (
          <div className="absolute top-0 right-0">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// KOMPONENT: Buyurtma kartochkasi
// ============================================================
interface OrderItem {
  id: string;
  client: string;
  time: string;
  amount: number;
  status: string;
  phone?: string;
}

function OrderCard({ 
  order, 
  statusConfig, 
  formatCurrency, 
  isSelected, 
  onSelect 
}: {
  order: OrderItem;
  statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }>;
  formatCurrency: (amount: number) => string;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const status = statusConfig[order.status] || statusConfig.delivered;
  const StatusIcon = status.icon;

  return (
    <div 
      className={`
        bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 touch-press cursor-pointer
        active:scale-[0.98]
        ${isSelected 
          ? 'border-amber-400 shadow-lg shadow-amber-500/10' 
          : 'border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900/60 hover:shadow-md'
        }
      `}
      onClick={() => onSelect(isSelected ? null : order.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(isSelected ? null : order.id); }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
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
              inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-1
              ${status.color}
            `}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>
        
        {/* Ochiluvchi harakatlar paneli */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in-up">
            <div className="flex gap-2">
              <a 
                href={`tel:${order.phone || '+998711401414'}`}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 py-2.5 rounded-xl transition touch-press active:scale-[0.95]"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-4 h-4" />
                Bog&apos;lanish
              </a>
              <Link 
                href="/agent/orders"
                className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 py-2.5 rounded-xl transition touch-press active:scale-[0.95]"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
                Batafsil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ASOSIY KOMPONENT
// ============================================================
export function AgentHome() {
  const [userName, setUserName] = useState<string>('Sardor');
  const [activeStat, setActiveStat] = useState<string | null>('revenue');
  const [selectedOrder, setSelectedOrder] = useState<string | null>('HLV-2026-00104');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    topProducts: [
      { name: 'Kunjutli Premium Holva', sales: 142, revenue: 28400000, growth: 12 },
      { name: 'Shokoladli Yong\'oqli Holva', sales: 98, revenue: 19600000, growth: 8 },
      { name: 'Pista Mag\'izli Samarqand', sales: 76, revenue: 15200000, growth: 15 },
      { name: 'Kungaboqar Klassik Holvasi', sales: 54, revenue: 10800000, growth: 5 },
    ],
    recommendations: [
      { store: 'Korzinka — Chilonzor', suggestion: 'Shokoladli Yong\'oqli Holvadan ko\'proq buyurtma qiling — talab 15% ga oshdi' },
      { store: 'Makro Supermarket — Sergeli', suggestion: 'Kichik qadoqli holvalardan qo\'shing — kassa zonasida tez sotiladi' },
      { store: 'Havas Diskaunter — Qo\'yliq', suggestion: 'Klassik holva zaxirasini oshiring — xaridorlar talabi yuqori' },
    ],
    ordersList: [
      { id: 'HLV-2026-00104', client: 'Korzinka — Chilonzor', time: '05:21', amount: 14800000, status: 'delivered', phone: '+998711401414' },
      { id: 'HLV-2026-00105', client: 'Makro Supermarket — Sergeli', time: '00:21', amount: 9200000, status: 'accepted', phone: '+998712051222' },
      { id: 'HLV-2026-00106', client: 'Havas Diskaunter — Qo\'yliq', time: '11:21', amount: 21500000, status: 'shipping', phone: '+998712000007' },
      { id: 'HLV-2026-00107', client: 'Baraka Qandolat Do\'koni', time: '03:21', amount: 4600000, status: 'ready', phone: '+998909876543' },
    ],
    salesChart: {
      days: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
      values: [2.8, 3.2, 2.5, 4.1, 3.8, 5.2, 4.5]
    }
  };

  const statusConfig = {
    delivered: { label: 'Yetkazib berildi', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    accepted: { label: 'Qabul qilindi', icon: Clock, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    shipping: { label: 'Yetkazilmoqda', icon: Truck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    ready: { label: 'Tayyor (Omborda)', icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  };

  return (
    <div className="space-y-5 pb-28 animate-fade-in-up max-w-lg mx-auto p-4 relative">
      
      {/* 1. Salomlashuv va Chat tugmasi */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Salom, <span className="text-amber-600 dark:text-amber-400">{agentData.name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 capitalize">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Chat modalini ochish tugmasi */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="relative p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md transition touch-press active:scale-[0.95] cursor-pointer"
            aria-label="Chat with admin"
          >
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </button>
          {/* Profil tugmasi */}
          <Link href="/agent/profile">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition touch-press active:scale-[0.95] cursor-pointer border border-amber-200/50">
              <Users className="w-5 h-5" />
            </div>
          </Link>
        </div>
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
      <div 
        className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-6 border border-amber-200/60 dark:border-amber-800/40 shadow-xs hover:shadow-md transition cursor-pointer touch-press active:scale-[0.99]"
        onClick={() => setShowAnalytics(!showAnalytics)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowAnalytics(!showAnalytics); }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Bugungi Savdo
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(agentData.todayRevenue)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" />
                Rejadan {agentData.revenuePercent}% ortiq
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                {showAnalytics ? 'Yashirish' : 'Batafsil'}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <CircleDollarSign className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        {/* Haftalik savdo grafigi */}
        {showAnalytics && (
          <div className="mt-4 pt-4 border-t border-amber-200/40 dark:border-amber-800/40 animate-fade-in-up">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2.5">Haftalik savdo dinamikasi (mln so&apos;mda)</p>
            <div className="flex items-end gap-1.5 h-24 pt-2">
              {agentData.salesChart.days.map((day, i) => {
                const height = (agentData.salesChart.values[i] / 6) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full max-w-8 bg-amber-500 rounded-t-lg transition-all duration-700 hover:bg-amber-600 shadow-xs"
                      style={{ height: `${height}%`, minHeight: '6px' }}
                    />
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Oylik Komissiya va Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Oylik Komissiya & Bonus
            </p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(agentData.commission)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{formatCurrency(agentData.commissionPaid)}</p>
            <p className="text-[11px] text-gray-400">To&apos;langan</p>
          </div>
        </div>
        
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

      {/* 4. Interaktiv Statistika Kartochkalari */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={ShoppingBag}
          label="Buyurtmalar"
          value={`${agentData.orders} ta`}
          subtext="✅ Barchasi qabul qilindi"
          color="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
          isActive={activeStat === 'orders'}
          onClick={() => setActiveStat(activeStat === 'orders' ? null : 'orders')}
        />
        <StatCard 
          icon={Store}
          label="Tashriflar"
          value={`${agentData.visits} ta`}
          subtext={`${agentData.visits} / ${agentData.visitPlan} reja`}
          color="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
          isActive={activeStat === 'visits'}
          onClick={() => setActiveStat(activeStat === 'visits' ? null : 'visits')}
        />
        <div className="col-span-2">
          <StatCard 
            icon={Users}
            label="Biriktirilgan Do'konlar"
            value={`${agentData.stores} ta faol savdo nuqtasi`}
            subtext="Muntazam xarid qiluvchi mijozlar"
            color="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
            isActive={activeStat === 'stores'}
            onClick={() => setActiveStat(activeStat === 'stores' ? null : 'stores')}
          />
        </div>
      </div>

      {/* 5. Eng ko'p sotilgan mahsulotlar (Top-Tovarlar) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Eng Ko&apos;p Sotilgan Mahsulotlar
            </h2>
            <p className="text-xs text-gray-400">Oxirgi 30 kunlik natijalar</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
            Barchasi →
          </Link>
        </div>
        <div className="space-y-2.5">
          {agentData.topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${index === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 
                  index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' : 
                  'bg-gray-50 dark:bg-gray-800/40 text-gray-400'}
              `}>
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.sales} dona · {formatCurrency(product.revenue)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                <ArrowUp className="w-3 h-3" />
                +{product.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI Magazinlarga Maslahatlar (Tavsiyalar) */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Magazinlarga AI Maslahatlar
            </h2>
            <p className="text-xs text-blue-600 dark:text-blue-400">Savdoni oshirish uchun aqlli tavsiyalar</p>
          </div>
          <button 
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="p-1.5 hover:bg-white/60 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer text-gray-500"
            aria-label="Tavsiyalarni ko'rish/yashirish"
          >
            {showRecommendations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {showRecommendations && (
          <div className="space-y-2.5 animate-fade-in-up">
            {agentData.recommendations.map((rec, index) => (
              <div key={index} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs rounded-xl p-3 border border-white/60 dark:border-gray-800 shadow-xs">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{rec.store}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-start gap-1.5">
                  <span className="text-blue-500">💡</span>
                  <span>{rec.suggestion}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Oxirgi Buyurtmalar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Oxirgi Buyurtmalarim</h2>
          <Link href="/agent/orders" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition touch-press">
            Barchasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {agentData.ordersList.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statusConfig={statusConfig}
              formatCurrency={formatCurrency}
              isSelected={selectedOrder === order.id}
              onSelect={setSelectedOrder}
            />
          ))}
        </div>
      </div>

      {/* 8. Floating Action Button: Admin bilan chat modalini ochish */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-4 py-3 rounded-full shadow-lg shadow-amber-500/30 transition touch-press active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-bold">Admin bilan bog&apos;lanish</span>
        </button>
      </div>

      {/* 9. Jonli Chat Modali */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

    </div>
  );
}

export default AgentHome;
