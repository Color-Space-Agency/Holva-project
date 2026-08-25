'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, Store, Users, 
  Phone, ChevronRight, CheckCircle, Clock, 
  Truck, Package, CircleDollarSign, 
  Star, Zap, MessageCircle, BarChart3,
  Eye, EyeOff, Sparkles, ArrowUp, ArrowDown,
  X, Calendar, RefreshCw, Send, Plus, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { 
  INITIAL_STORES, 
  getStoredCompletedVisitsCount, 
  setStoredCompletedVisitsCount,
  getStoredVisits,
  completeStoredVisit
} from '@/lib/mock-data';
import { toast } from 'sonner';

// ============================================================
// KOMPONENT: Haftalik / Oylik / Sana oralig'i Analitika Modali
// ============================================================
interface ChartItem {
  day: string;
  value: number; // so'm miqdorida
}

function AnalyticsModal({ 
  isOpen, 
  onClose, 
  data,
  totalAmount
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: ChartItem[];
  totalAmount: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose} 
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-gray-800 slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Batafsil Savdo Analitikasi</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 mobile-scroll overflow-y-auto max-h-[70vh]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tanlangan Davr Tushumi</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="h-56 bg-amber-50/50 dark:bg-gray-800/40 rounded-2xl p-4 border border-amber-100 dark:border-gray-800">
            <div className="flex items-end gap-2 h-full pt-4">
              {data.map((item, i) => {
                const maxVal = Math.max(...data.map(d => d.value), 1000000);
                const height = (item.value / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 text-center leading-tight">
                      {(item.value / 1000000).toFixed(1)}M
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all hover:bg-amber-600 shadow-xs"
                      style={{ height: `${height}%`, minHeight: '6px' }}
                      title={`${item.day}: ${formatCurrency(item.value)}`}
                    />
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate max-w-full text-center">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summalar ro'yxati */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Kunlik aniq summalar:</p>
            <div className="grid grid-cols-2 gap-2">
              {data.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl text-xs flex justify-between items-center">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">{item.day}:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 text-center">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">O&apos;sish Dinamikasi</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">+18%</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-3.5 text-center">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400">O&apos;rtacha Kunlik</p>
              <p className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">
                {formatCurrency(Math.round(totalAmount / (data.length || 1)))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONENT: Jonli Chat Modali
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
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />
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
// ASOSIY KOMPONENT: AgentHome
// ============================================================
export function AgentHome() {
  const [userName, setUserName] = useState<string>('Sardor');
  const [selectedOrder, setSelectedOrder] = useState<string | null>('HLV-2026-00104');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Tashriflar holati (LocalStorage bilan bog'langan)
  const [visits, setVisits] = useState({ completed: 9, plan: 12 });
  const [isVisitLoading, setIsVisitLoading] = useState(false);
  
  // Savdo dinamikasi tablari: 'week' | 'month' | 'custom'
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'custom'>('week');
  const [fromDate, setFromDate] = useState<string>('2026-08-20');
  const [toDate, setToDate] = useState<string>('2026-08-26');
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);

    // LocalStorage dan saqlangan tashriflar sonini olish
    const storedCount = getStoredCompletedVisitsCount();
    setVisits({ completed: storedCount, plan: 12 });

    const handleVisitsUpdated = (e: CustomEvent<{ count: number }>) => {
      if (e.detail && typeof e.detail.count === 'number') {
        setVisits({ completed: e.detail.count, plan: 12 });
      }
    };
    window.addEventListener('visits-updated' as any, handleVisitsUpdated);
    return () => window.removeEventListener('visits-updated' as any, handleVisitsUpdated);
  }, []);

  // Agent ma'lumotlari
  const agentData = {
    name: userName,
    todayRevenue: 22400000,
    revenuePercent: 118,
    orders: 6,
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
    // Haftalik ma'lumotlar (so'mda)
    weeklyData: [
      { day: 'Dush', value: 2800000 },
      { day: 'Sesh', value: 3200000 },
      { day: 'Chor', value: 2500000 },
      { day: 'Pay', value: 4100000 },
      { day: 'Jum', value: 3800000 },
      { day: 'Shan', value: 5200000 },
      { day: 'Yak', value: 4500000 }
    ],
    // Oylik ma'lumotlar (so'mda)
    monthlyData: [
      { day: '1-hafta', value: 12500000 },
      { day: '2-hafta', value: 15200000 },
      { day: '3-hafta', value: 14800000 },
      { day: '4-hafta', value: 18300000 }
    ],
    // Sanadan-sanagacha ma'lumotlar (so'mda)
    customData: [
      { day: '20-Avg', value: 3100000 },
      { day: '21-Avg', value: 4200000 },
      { day: '22-Avg', value: 2900000 },
      { day: '23-Avg', value: 4600000 },
      { day: '24-Avg', value: 3800000 },
      { day: '25-Avg', value: 5400000 },
      { day: '26-Avg', value: 4800000 },
    ]
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    delivered: { label: 'Yetkazib berildi', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    accepted: { label: 'Qabul qilindi', icon: Clock, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    shipping: { label: 'Yetkazilmoqda', icon: Truck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    ready: { label: 'Tayyor (Omborda)', icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  };

  // Tashrifni yakunlash funksiyasi (LocalStorage ga yozish va sonini oshirish)
  const completeVisit = () => {
    setIsVisitLoading(true);
    setTimeout(() => {
      const storedVisits = getStoredVisits();
      const inProgressOrPlanned = storedVisits.find(v => v.status === 'IN_PROGRESS' || v.status === 'PLANNED');
      
      let newCount = visits.completed + 1;
      if (inProgressOrPlanned) {
        const res = completeStoredVisit(inProgressOrPlanned.id);
        newCount = res.completedCount;
      } else {
        newCount = Math.min(visits.completed + 1, visits.plan);
        setStoredCompletedVisitsCount(newCount);
      }

      setVisits(prev => ({
        ...prev,
        completed: newCount
      }));
      setIsVisitLoading(false);
      toast.success(`✅ Tashrif yakunlandi! Bugungi natija: ${newCount}/${visits.plan}`);
    }, 500);
  };

  const getChartData = () => {
    if (activeTab === 'week') return agentData.weeklyData;
    if (activeTab === 'month') return agentData.monthlyData;
    return agentData.customData;
  };

  const currentChartData = getChartData();
  const totalPeriodRevenue = currentChartData.reduce((acc, curr) => acc + curr.value, 0);

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
          <Link href="/agent/profile">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition touch-press active:scale-[0.95] cursor-pointer border border-amber-200/50">
              <Users className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tezkor harakat tugmalari */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/agent/orders?new=true" className="w-full">
          <button className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl text-xs font-bold gap-2 flex items-center justify-center shadow-md shadow-amber-500/20 cursor-pointer touch-friendly active:scale-95">
            <Plus className="h-4 w-4" /> Yangi Buyurtma
          </button>
        </Link>
        <Link href="/agent/visits" className="w-full">
          <button className="w-full h-12 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-2xl text-xs font-bold gap-2 flex items-center justify-center cursor-pointer touch-friendly active:scale-95">
            <MapPin className="h-4 w-4 text-amber-600" /> Tashriflar ({visits.completed}/{visits.plan})
          </button>
        </Link>
      </div>

      {/* 2. Asosiy karta - Bugungi Savdo va Moslashuvchan Savdo Dinamikasi */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-6 border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Bugungi Savdo
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(agentData.todayRevenue)}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" />
                Rejadan {agentData.revenuePercent}% ortiq
              </span>
              <button 
                onClick={() => setIsAnalyticsModalOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer touch-press"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Batafsil hisobot
              </button>
            </div>
          </div>
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <CircleDollarSign className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Dinamik Savdo Grafigi (Hafta | Oy | Sana oralig'i va Summalar) */}
        <div className="mt-4 pt-4 border-t border-amber-200/40 dark:border-amber-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Savdo dinamikasi ({formatCurrency(totalPeriodRevenue)})
              </p>
            </div>
            
            {/* Tablar */}
            <div className="flex gap-1 bg-amber-100/60 dark:bg-amber-950/60 p-0.5 rounded-xl self-start sm:self-auto">
              <button 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${activeTab === 'week' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('week')}
              >
                Hafta
              </button>
              <button 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${activeTab === 'month' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('month')}
              >
                Oy
              </button>
              <button 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${activeTab === 'custom' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('custom')}
              >
                <Calendar className="w-3 h-3" />
                Sana tanlash
              </button>
            </div>
          </div>

          {/* Sana oralig'ini tanlash maydonlari */}
          {activeTab === 'custom' && (
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs animate-fade-in">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-0.5 font-semibold">Dan:</label>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 dark:text-white outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-0.5 font-semibold">Gacha:</label>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Ustunli grafik ustida aniq summalar bilan */}
          <div className="flex items-end gap-1.5 h-24 pt-4">
            {currentChartData.map((item, i) => {
              const maxVal = Math.max(...currentChartData.map(d => d.value), 1000000);
              const height = (item.value / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip & Summa ko'rsatkichi */}
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    {(item.value / 1000000).toFixed(1)}M
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md transition-all duration-500 hover:bg-amber-600 shadow-xs cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '6px' }}
                    title={`${item.day}: ${formatCurrency(item.value)}`}
                  />
                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 truncate max-w-full text-center">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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

      {/* 4. Statistika Kartochkalari (Real-Vaqtda 10/12 Reja bilan) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Buyurtmalar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{agentData.orders}</p>
              <p className="text-xs text-gray-400">Buyurtmalar</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Barchasi qabul qilindi
          </p>
        </div>

        {/* Tashriflar - Real-vaqtda oshuvchi reja */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl">
              <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{visits.completed}</p>
              <p className="text-xs text-gray-400">Tashriflar</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5 gap-1">
            <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
              {visits.completed} / {visits.plan} reja
            </p>
            <button 
              onClick={completeVisit}
              disabled={isVisitLoading || visits.completed >= visits.plan}
              className={`
                text-[10px] font-black px-2.5 py-1 rounded-xl transition cursor-pointer
                ${visits.completed >= visits.plan 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 active:scale-95 shadow-xs'
                }
                touch-press
              `}
            >
              {isVisitLoading ? (
                <span className="flex items-center gap-1">
                  <RefreshCw className="animate-spin h-3 w-3" />
                  ...
                </span>
              ) : visits.completed >= visits.plan ? (
                '✅ To\'ldi'
              ) : (
                '+ Yakunlash'
              )}
            </button>
          </div>
        </div>

        {/* Do'konlar */}
        <div className="col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{agentData.stores} ta savdo nuqtasi</p>
              <p className="text-xs text-gray-400">Biriktirilgan Do&apos;konlar</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
            Muntazam xarid qiluvchi faol mijozlar tarmog&apos;i
          </p>
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

      {/* 6. AI Magazinlarga Maslahatlar */}
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

      {/* 9. Analitika Modali */}
      <AnalyticsModal 
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        data={currentChartData}
        totalAmount={totalPeriodRevenue}
      />

      {/* 10. Jonli Chat Modali */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

    </div>
  );
}

export default AgentHome;
