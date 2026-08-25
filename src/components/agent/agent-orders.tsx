'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Store, ArrowLeft, CreditCard, 
  Wallet, Building2, AlertCircle, X, RefreshCw, 
  CheckCircle, Clock, Truck, Package, Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  MockOrder, 
  getStoredOrders, 
  recordStoredOrderPayment, 
  createStoredOrder 
} from '@/lib/mock-data';
import { AgentOrderForm } from './agent-order-form';
import { OrderStatusBadge, OrderPaymentStatusBadge } from '@/components/orders/order-status-badge';
import { toast } from 'sonner';

// ============================================================
// KOMPONENT: Buyurtma To'lovini Qabul Qilish Modali (Fixed Frame UI/UX)
// ============================================================
function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  order: MockOrder | null;
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

  const orderTotal = order?.total_amount || 0;
  const paidAmount = order?.paid_amount || 0;
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
        
        {/* Modal Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">To&apos;lov qabul qilish</h3>
            <p className="text-xs text-gray-400 truncate max-w-[240px] mt-0.5">{order.store_name} ({order.order_number})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
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

          {/* Fixed Modal Footer: Doim ko'rinib turuvchi tasdiqlash tugmasi */}
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
// ASOSIY KOMPONENT: AgentOrders
// ============================================================
export function AgentOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // To'lov modali
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<MockOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // LocalStorage dan buyurtmalarni yuklash
    setOrders(getStoredOrders());

    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }

    const handleOrdersUpdated = (e: CustomEvent<{ orders: MockOrder[] }>) => {
      if (e.detail && Array.isArray(e.detail.orders)) {
        setOrders(e.detail.orders);
      }
    };
    window.addEventListener('orders-updated' as any, handleOrdersUpdated);
    return () => window.removeEventListener('orders-updated' as any, handleOrdersUpdated);
  }, [searchParams]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.store_name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOrderCreated = (newOrder: any) => {
    const updated = createStoredOrder(newOrder);
    setOrders(updated);
    setIsFormOpen(false);
    toast.success("✅ Yangi buyurtma yaratildi!");
  };

  const handlePaymentSuccess = (paymentData: { orderId: string; amount: number; method: string }) => {
    const { orders: updatedOrders } = recordStoredOrderPayment(paymentData.orderId, paymentData.amount);
    setOrders(updatedOrders);
  };

  const openPaymentModal = (order: MockOrder) => {
    setSelectedOrderForPayment(order);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4 pb-28 max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur py-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Orqaga"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtmalarim</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Yangi
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buyurtma yoki do'kon qidirish..."
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
        {filteredOrders.map((order) => {
          const remaining = order.total_amount - (order.paid_amount || 0);
          const isFullyPaid = (order.paid_amount || 0) >= order.total_amount;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4.5 space-y-3 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {order.order_number}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mt-0.5 flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-gray-400" />
                    {order.store_name}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <OrderStatusBadge status={order.status} />
                  <OrderPaymentStatusBadge status={order.payment_status} />
                </div>
              </div>

              {/* Summa va To'langan miqdorlar bloki */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Jami buyurtma:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">To&apos;langan summa:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(order.paid_amount || 0)}
                  </span>
                </div>
                {!isFullyPaid && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Qoldiq qarz:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{formatCurrency(remaining)}</span>
                  </div>
                )}
              </div>

              {/* Pastki Harakatlar Paneli */}
              <div className="flex items-center justify-between pt-1 text-xs gap-2">
                <span className="text-[11px] text-gray-400">
                  {new Date(order.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <div className="flex gap-2 items-center">
                  {!isFullyPaid ? (
                    <button
                      onClick={() => openPaymentModal(order)}
                      className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition touch-press active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      To&apos;lov qabul qilish
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-xl border border-emerald-200/50">
                      <CheckCircle className="w-3.5 h-3.5" /> To&apos;liq to&apos;langan
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

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

      {/* To'lov Qabul Qilish Modali */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrderForPayment(null);
        }}
        order={selectedOrderForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default AgentOrders;
