'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, ShoppingBag, Store, Users, 
  Phone, ChevronRight, CheckCircle, Clock, 
  Truck, Package, CircleDollarSign, 
  Star, Zap, MessageCircle, BarChart3,
  Eye, EyeOff, Sparkles, ArrowUp, ArrowDown,
  X, Calendar, RefreshCw, CreditCard, 
  Wallet, Building2, Plus, AlertCircle, Send, MapPin,
  Flame, Award
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { 
  INITIAL_STORES, 
  getStoredCompletedVisitsCount, 
  setStoredCompletedVisitsCount,
  getStoredVisits,
  completeStoredVisit,
  getStoredOrders,
  recordStoredOrderPayment,
  MockOrder,
  getStoredChatMessages,
  sendStoredChatMessage,
  syncChatMessagesFromServer,
  syncOrdersFromServer,
  RealtimeChatMessage
} from '@/lib/mock-data';
import { toast } from 'sonner';

// ============================================================
// KOMPONENT: Buyurtma To'lovini Qabul Qilish Modali
// ============================================================
interface OrderItem {
  id: string;
  client: string;
  time: string;
  amount: number;
  status: string;
  phone?: string;
  paidAmount?: number;
}

function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  onPaymentSuccess: (paymentData: { orderId: string; amount: number; method: string }) => void;
}) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { id: 'cash', label: 'Naqd', icon: Wallet, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
    { id: 'card', label: 'Plastik karta', icon: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
    { id: 'transfer', label: 'O\'tkazma', icon: Building2, color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
  ];

  const orderTotal = order?.amount || 0;
  const paidAmount = order?.paidAmount || 0;
  const remainingAmount = Math.max(orderTotal - paidAmount, 0);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Iltimos, to\'g\'ri summani kiriting');
      return;
    }

    if (paymentAmount > remainingAmount) {
      setError(`To'lov miqdori qoldiqdan (${formatCurrency(remainingAmount)}) oshib ketdi`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onPaymentSuccess({
        orderId: order.id,
        amount: paymentAmount,
        method: paymentMethod,
      });
      setIsLoading(false);
      onClose();
      toast.success(`✅ ${formatCurrency(paymentAmount)} to'lov muvaffaqiyatli qabul qilindi!`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-3xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col slide-up shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">To&apos;lov qabul qilish</h3>
            <p className="text-xs text-gray-400 truncate max-w-[240px] mt-0.5">{order.client}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 mobile-scroll">
            {/* Buyurtma hisob-kitobi */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400">Umumiy summa:</span>
                <span className="font-black text-gray-900 dark:text-white">{formatCurrency(orderTotal)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400">To&apos;langan:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-bold">Qoldiq qarz:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            {/* To'lov usuli tanlash */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">To&apos;lov usuli</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition cursor-pointer
                      ${paymentMethod === method.id 
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      touch-press active:scale-95
                    `}
                    onClick={() => setPaymentMethod(method.id as any)}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-[11px] font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summa kiritish */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                To&apos;lov miqdori (so&apos;m)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">UZS</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masalan: 500000"
                  className="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white font-bold text-sm outline-none"
                  required
                  min="1"
                  max={remainingAmount}
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            {/* Tezkor summalar */}
            <div className="flex gap-2 flex-wrap">
              {[500000, 1000000, 2000000, remainingAmount].filter(a => a > 0).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition cursor-pointer touch-press"
                  onClick={() => setAmount(preset.toString())}
                >
                  {preset === remainingAmount ? "To'liq qoldiq" : formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 p-4 sm:p-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border-t border-gray-100 dark:border-gray-800 pb-7 sm:pb-5">
            <button
              type="submit"
              disabled={isLoading || remainingAmount <= 0}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold py-3.5 rounded-2xl transition touch-press active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin h-4 w-4" />
                  Qabul qilinmoqda...
                </span>
              ) : (
                `💰 To'lovni qabul qilish`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONENT: Buyurtma kartochkasi (Kengaytirilgan To'lov Bilan)
// ============================================================
function OrderCard({ 
  order, 
  statusConfig, 
  formatCurrency, 
  isSelected, 
  onSelect,
  onPayment
}: {
  order: OrderItem;
  statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }>;
  formatCurrency: (amount: number) => string;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onPayment: (order: OrderItem) => void;
}) {
  const status = statusConfig[order.status] || statusConfig.delivered;
  const StatusIcon = status.icon;
  const remaining = order.amount - (order.paidAmount || 0);

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
            <p className="font-black text-gray-900 dark:text-white text-sm">{formatCurrency(order.amount)}</p>
            <div className="flex flex-col items-end gap-0.5 mt-1">
              <span className={`
                inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border
                ${status.color}
              `}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
              {(order.paidAmount || 0) > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  ✅ {formatCurrency(order.paidAmount || 0)} to&apos;langan
                </span>
              )}
              {remaining > 0 && order.status !== 'delivered' && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  ⏳ Qoldiq: {formatCurrency(remaining)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Ochiluvchi harakatlar paneli */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in-up">
            <div className="flex gap-2 flex-wrap">
              <button 
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 py-2.5 rounded-xl transition touch-press active:scale-[0.95] cursor-pointer shadow-sm shadow-amber-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayment(order);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                To&apos;lov qabul qilish
              </button>
              <a 
                href={`tel:${order.phone || '+998711401414'}`}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3.5 py-2.5 rounded-xl transition touch-press active:scale-[0.95]"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Bog&apos;lanish
              </a>
              <Link 
                href="/agent/orders"
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 px-3.5 py-2.5 rounded-xl transition touch-press active:scale-[0.95]"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-3.5 h-3.5" />
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
// KOMPONENT: Haftalik / Oylik Analitika Modali
// ============================================================
interface ChartItem {
  day: string;
  fullDate?: string;
  value: number;
}

function getDynamicCustomData(fromStr: string, toStr: string): ChartItem[] {
  try {
    const start = new Date(fromStr);
    const end = new Date(toStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [{ day: 'Bugun', fullDate: 'Bugungi savdo', value: 3800000 }];
    }

    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const items: ChartItem[] = [];

    if (diffDays <= 14) {
      for (let i = 0; i < diffDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dayOfMonth = d.getDate();
        const monthName = d.toLocaleDateString('uz-UZ', { month: 'short' });
        const weekdayName = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const fullDateStr = d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 10;
        const base = 2600000;
        const variable = (seed * 380000) + (d.getDay() === 0 || d.getDay() === 6 ? 1400000 : 0);
        const val = base + variable;

        items.push({
          day: `${dayOfMonth}-${monthName}`,
          fullDate: `${fullDateStr} (${weekdayName})`,
          value: val,
        });
      }
    } else {
      const step = Math.ceil(diffDays / 6);
      for (let i = 0; i < diffDays; i += step) {
        const segStart = new Date(start);
        segStart.setDate(start.getDate() + i);
        const segEnd = new Date(start);
        segEnd.setDate(Math.min(start.getDate() + i + step - 1, end.getDate()));

        const startLabel = `${segStart.getDate()}-${segStart.toLocaleDateString('uz-UZ', { month: 'short' })}`;
        const endLabel = `${segEnd.getDate()}-${segEnd.toLocaleDateString('uz-UZ', { month: 'short' })}`;
        const fullRange = `${segStart.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })} — ${segEnd.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        const daysInSeg = Math.round((segEnd.getTime() - segStart.getTime()) / (1000 * 3600 * 24)) + 1;
        const seed = (segStart.getDate() + segEnd.getDate()) % 7;
        const segVal = (3200000 + seed * 450000) * daysInSeg;

        items.push({
          day: `${startLabel}`,
          fullDate: fullRange,
          value: segVal,
        });
      }
    }

    return items;
  } catch (e) {
    return [{ day: 'Tanlangan davr', fullDate: 'Umumiy davr', value: 4500000 }];
  }
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-gray-800 slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Batafsil Savdo Analitikasi</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

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

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Kunlik aniq summalar:</p>
            <div className="grid grid-cols-2 gap-2">
              {data.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl text-xs flex justify-between items-center border border-gray-100 dark:border-gray-700/50">
                  <span className="font-semibold text-gray-600 dark:text-gray-300 truncate mr-2">{item.day}:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">{formatCurrency(item.value)}</span>
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
function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getStoredChatMessages('sardor'));

    // Serverdan xabarlarni yuklash
    syncChatMessagesFromServer('sardor').then((srvMsgs) => {
      if (srvMsgs) {
        setMessages(srvMsgs.filter((m) => (m.agentId || 'sardor') === 'sardor'));
      }
    });

    const handleChatUpdated = (e: CustomEvent<{ messages: RealtimeChatMessage[]; agentId?: string }>) => {
      if (e.detail && Array.isArray(e.detail.messages)) {
        setMessages(e.detail.messages.filter((m) => (m.agentId || 'sardor') === 'sardor'));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'holva_crm_chat_messages') {
        setMessages(getStoredChatMessages('sardor'));
      }
    };

    window.addEventListener('holva-chat-updated' as any, handleChatUpdated);
    window.addEventListener('storage', handleStorage);

    // Cross-device server polling (har 1.5 soniyada serverdan tekshirish)
    const interval = setInterval(() => {
      syncChatMessagesFromServer('sardor').then((srvMsgs) => {
        if (srvMsgs && srvMsgs.length > 0) {
          setMessages(srvMsgs.filter((m) => (m.agentId || 'sardor') === 'sardor'));
        }
      });
    }, 1500);

    return () => {
      window.removeEventListener('holva-chat-updated' as any, handleChatUpdated);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const agentName = localStorage.getItem('user_name') || 'Sardor Rahimov';
    const updated = sendStoredChatMessage('sardor', 'agent', agentName, message.trim());
    setMessages(updated.filter((m) => (m.agentId || 'sardor') === 'sardor'));
    setMessage('');

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-gray-800 slide-up flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Super Admin Bilan Aloqa</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Online · Jonli sinxron
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Messages Body */}
        <div className="p-4 space-y-3 h-80 overflow-y-auto mobile-scroll bg-gray-50/40 dark:bg-gray-950/40">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs sm:text-sm shadow-xs ${
                  msg.sender === 'agent'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
                }`}
              >
                <p className={`text-[10px] font-bold mb-0.5 ${msg.sender === 'agent' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>
                  {msg.senderName}
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'agent' ? 'text-amber-100' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Bar */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Admin bilan bog'lanish..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white placeholder-gray-400"
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
// ASOSIY KOMPONENT: AgentHome
// ============================================================
export function AgentHome() {
  const [userName, setUserName] = useState<string>('Sardor');
  const [selectedOrder, setSelectedOrder] = useState<string | null>('HLV-2026-00104');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Tashriflar holati
  const [visits, setVisits] = useState({ completed: 9, plan: 12 });
  const [isVisitLoading, setIsVisitLoading] = useState(false);
  
  // To'lov modali holati
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Savdo dinamikasi tablari: 'week' | 'month' | 'custom'
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'custom'>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>('2026-08-20');
  const [toDate, setToDate] = useState<string>('2026-08-26');
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Buyurtmalar ro'yxati (To'langan summasi bilan)
  const [ordersList, setOrdersList] = useState<OrderItem[]>([
    { id: 'HLV-2026-00104', client: 'Korzinka — Chilonzor', time: '05:21', amount: 14800000, status: 'delivered', phone: '+998711401414', paidAmount: 14800000 },
    { id: 'HLV-2026-00105', client: 'Makro Supermarket — Sergeli', time: '00:21', amount: 9200000, status: 'accepted', phone: '+998712051222', paidAmount: 5000000 },
    { id: 'HLV-2026-00106', client: 'Havas Diskaunter — Qo\'yliq', time: '11:21', amount: 21500000, status: 'shipping', phone: '+998712000007', paidAmount: 0 },
    { id: 'HLV-2026-00107', client: 'Baraka Qandolat Do\'koni', time: '03:21', amount: 4600000, status: 'ready', phone: '+998909876543', paidAmount: 2000000 },
  ]);

  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);

    const storedCount = getStoredCompletedVisitsCount();
    setVisits({ completed: storedCount, plan: 12 });

    // Stored orders dan yuklash
    const stored = getStoredOrders();
    if (stored && stored.length > 0) {
      const mapped: OrderItem[] = stored.map((o: MockOrder) => ({
        id: o.order_number,
        client: o.store_name,
        time: new Date(o.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        amount: o.total_amount,
        status: o.status.toLowerCase(),
        paidAmount: o.paid_amount || 0,
      }));
      setOrdersList(mapped);
    }

    // Serverdan eng yangi buyurtmalarni yuklash
    syncOrdersFromServer().then((srv) => {
      if (srv && srv.length > 0) {
        const mapped: OrderItem[] = srv.map((o: MockOrder) => ({
          id: o.order_number,
          client: o.store_name,
          time: new Date(o.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          amount: o.total_amount,
          status: o.status.toLowerCase(),
          paidAmount: o.paid_amount || 0,
        }));
        setOrdersList(mapped);
      }
    });

    const handleVisitsUpdated = (e: CustomEvent<{ count: number }>) => {
      if (e.detail && typeof e.detail.count === 'number') {
        setVisits({ completed: e.detail.count, plan: 12 });
      }
    };

    const handleOrdersUpdated = (e: CustomEvent<{ orders: MockOrder[] }>) => {
      if (e.detail && Array.isArray(e.detail.orders)) {
        const mapped: OrderItem[] = e.detail.orders.map((o: MockOrder) => ({
          id: o.order_number,
          client: o.store_name,
          time: new Date(o.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          amount: o.total_amount,
          status: o.status.toLowerCase(),
          paidAmount: o.paid_amount || 0,
        }));
        setOrdersList(mapped);
      }
    };

    window.addEventListener('visits-updated' as any, handleVisitsUpdated);
    window.addEventListener('orders-updated' as any, handleOrdersUpdated);

    // Cross-device server polling har 2 soniyada
    const interval = setInterval(() => {
      syncOrdersFromServer().then((srv) => {
        if (srv && srv.length > 0) {
          const mapped: OrderItem[] = srv.map((o: MockOrder) => ({
            id: o.order_number,
            client: o.store_name,
            time: new Date(o.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            amount: o.total_amount,
            status: o.status.toLowerCase(),
            paidAmount: o.paid_amount || 0,
          }));
          setOrdersList(mapped);
        }
      });
    }, 2000);

    return () => {
      window.removeEventListener('visits-updated' as any, handleVisitsUpdated);
      window.removeEventListener('orders-updated' as any, handleOrdersUpdated);
      clearInterval(interval);
    };
  }, []);

  // Agent ma'lumotlari
  const agentData = {
    name: userName,
    todayRevenue: 22400000,
    revenuePercent: 118,
    orders: ordersList.length,
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
    weeklyData: [
      { day: 'Dush', fullDate: '20-Avgust, Dushanba', value: 2800000 },
      { day: 'Sesh', fullDate: '21-Avgust, Seshanba', value: 3200000 },
      { day: 'Chor', fullDate: '22-Avgust, Chorshanba', value: 2500000 },
      { day: 'Pay', fullDate: '23-Avgust, Payshanba', value: 4100000 },
      { day: 'Jum', fullDate: '24-Avgust, Juma', value: 3800000 },
      { day: 'Shan', fullDate: '25-Avgust, Shanba', value: 5200000 },
      { day: 'Yak', fullDate: '26-Avgust, Yakshanba', value: 4500000 }
    ],
    monthlyData: [
      { day: '1-hafta', fullDate: '1 — 7 Avgust haftaligi', value: 12500000 },
      { day: '2-hafta', fullDate: '8 — 14 Avgust haftaligi', value: 15200000 },
      { day: '3-hafta', fullDate: '15 — 21 Avgust haftaligi', value: 14800000 },
      { day: '4-hafta', fullDate: '22 — 28 Avgust haftaligi', value: 18300000 }
    ]
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    delivered: { label: 'Yetkazib berildi', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    accepted: { label: 'Qabul qilindi', icon: Clock, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    confirmed: { label: 'Qabul qilindi', icon: Clock, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    shipping: { label: 'Yetkazilmoqda', icon: Truck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    delivering: { label: 'Yetkazilmoqda', icon: Truck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    ready: { label: 'Tayyor (Omborda)', icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  };

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

  // To'lov muvaffaqiyatli qabul qilinganda (Global storage ga saqlash)
  const handlePaymentSuccess = (paymentData: { orderId: string; amount: number; method: string }) => {
    recordStoredOrderPayment(paymentData.orderId, paymentData.amount);
  };

  const openPaymentModal = (order: OrderItem) => {
    setSelectedOrderForPayment(order);
    setIsPaymentModalOpen(true);
  };

  const currentChartData = useMemo(() => {
    if (activeTab === 'week') return agentData.weeklyData;
    if (activeTab === 'month') return agentData.monthlyData;
    return getDynamicCustomData(fromDate, toDate);
  }, [activeTab, fromDate, toDate]);

  const totalPeriodRevenue = useMemo(() => {
    return currentChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [currentChartData]);

  const activeItem = selectedDayIndex !== null && currentChartData[selectedDayIndex] ? currentChartData[selectedDayIndex] : null;
  const bestDay = useMemo(() => {
    return [...currentChartData].sort((a, b) => b.value - a.value)[0] || { day: '—', value: 0 };
  }, [currentChartData]);

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

      {/* 2. YANGILANGAN SAVDO DINAMIKASI (PREMIUM FINTECH UI/UX) */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        
        {/* Yuqori qism: Segmented Control & Analitika tugmasi */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => { setActiveTab('week'); setSelectedDayIndex(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'week' 
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Hafta
            </button>
            <button 
              onClick={() => { setActiveTab('month'); setSelectedDayIndex(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'month' 
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Oy
            </button>
            <button 
              onClick={() => { setActiveTab('custom'); setSelectedDayIndex(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                activeTab === 'custom' 
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Sana
            </button>
          </div>

          <button 
            onClick={() => setIsAnalyticsModalOpen(true)}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40 cursor-pointer touch-press"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Batafsil</span>
          </button>
        </div>

        {/* Sana tanlash (Agar custom tanlansa) */}
        {activeTab === 'custom' && (
          <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60 animate-fade-in text-xs">
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Boshlanish sanasi:</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setSelectedDayIndex(null);
                }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Tugash sanasi:</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setSelectedDayIndex(null);
                }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Jonli tanlangan kun / Umumiy davr ma'lumoti */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/40 dark:to-orange-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                {activeItem ? activeItem.fullDate || activeItem.day : (activeTab === 'custom' ? `Davr: ${fromDate} — ${toDate}` : 'Tanlangan Davr Tushumi')}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {formatCurrency(activeItem ? activeItem.value : totalPeriodRevenue)}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                {activeItem ? (
                  <>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {totalPeriodRevenue > 0 ? ((activeItem.value / totalPeriodRevenue) * 100).toFixed(0) : 0}%
                    </span> 
                    umumiy davr savdosidagi ulushi
                  </>
                ) : (
                  <>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3 inline" /> +18%
                    </span>
                    o&apos;tgan davrga nisbatan o&apos;sish sur&apos;ati
                  </>
                )}
              </p>
            </div>

            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-2xl border border-amber-200/50">
              <CircleDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Katta, qulay, interaktiv ustunlar (Interactive Chart Bars) */}
        <div className="pt-2">
          <div className="flex items-end gap-2 h-36 pt-6 pb-2 px-1 border-b border-gray-100 dark:border-gray-800">
            {currentChartData.map((item, i) => {
              const maxVal = Math.max(...currentChartData.map(d => d.value), 1000000);
              const height = (item.value / maxVal) * 100;
              const isSelected = selectedDayIndex === i;

              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDayIndex(isSelected ? null : i)}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative touch-friendly"
                >
                  <span className={`
                    text-[10px] font-black transition-all whitespace-nowrap
                    ${isSelected 
                      ? 'text-amber-600 dark:text-amber-400 scale-110 -translate-y-1 font-black' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-amber-600'
                    }
                  `}>
                    {(item.value / 1000000).toFixed(1)}M
                  </span>

                  <div 
                    className={`
                      w-full rounded-t-xl transition-all duration-300 relative
                      ${isSelected 
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/30 scale-x-105' 
                        : 'bg-gradient-to-t from-amber-400/70 to-amber-300/70 dark:from-amber-600/50 dark:to-amber-500/50 group-hover:from-amber-500 group-hover:to-amber-400'
                      }
                    `}
                    style={{ height: `${height}%`, minHeight: '12px' }}
                  >
                    {isSelected && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                    )}
                  </div>

                  <span className={`
                    text-[11px] transition-all font-bold mt-1 truncate max-w-full text-center
                    ${isSelected 
                      ? 'text-amber-600 dark:text-amber-400 scale-110 font-black' 
                      : 'text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Eng yaxshi kun: <strong className="text-gray-900 dark:text-white font-bold">{bestDay?.day} ({formatCurrency(bestDay?.value || 0)})</strong></span>
            </div>
            <div className="font-semibold text-[11px] text-amber-600 dark:text-amber-400">
              {activeItem ? "Tanlandi" : "Kunni bosing"}
            </div>
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

      {/* 7. Oxirgi Buyurtmalar (To'lov Qabul Qilish Bilan) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Oxirgi Buyurtmalarim</h2>
            <p className="text-xs text-gray-400">To&apos;lov holati bilan</p>
          </div>
          <Link href="/agent/orders" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition touch-press">
            Barchasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {ordersList.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statusConfig={statusConfig}
              formatCurrency={formatCurrency}
              isSelected={selectedOrder === order.id}
              onSelect={setSelectedOrder}
              onPayment={openPaymentModal}
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

      {/* 10. To'lov Qabul Qilish Modali */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrderForPayment(null);
        }}
        order={selectedOrderForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 11. Jonli Chat Modali */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

    </div>
  );
}

export default AgentHome;
