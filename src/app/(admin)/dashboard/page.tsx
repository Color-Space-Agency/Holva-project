'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, Users, ShoppingBag, DollarSign, TrendingUp, 
  Store, Package, Calendar, Clock, AlertCircle,
  CreditCard, Wallet, Building2, ChevronRight,
  Eye, EyeOff, RefreshCw, Plus, CheckCircle, Flame,
  FileSpreadsheet, Settings, ArrowUp, ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { AIAssistant } from '@/components/admin/ai-assistant';
import { formatCurrency } from '@/lib/utils';
import { INITIAL_STORES, INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { toast } from 'sonner';

// ============================================================
// KOMPONENT: STATISTIKA KARTOCHKASI
// ============================================================
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: number;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ icon: Icon, label, value, change, color, onClick, isActive }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer
        touch-press active:scale-[0.98]
        ${isActive 
          ? 'border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.01]' 
          : 'border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900/60 hover:shadow-md'
        }
      `}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {typeof change === 'number' && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-0.5 ${change > 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50' : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/50'}`}>
            {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="mt-3.5">
        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONENT: MAHSULOT FOTOSURATI (KESHDAN XOLI DINAMIK YUKLASH)
// ============================================================
function DynamicImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      const timestamp = new Date().getTime();
      const imageUrl = src.includes('?') ? `${src}&t=${timestamp}` : `${src}?t=${timestamp}`;
      
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok && isMounted) {
          setImageSrc(imageUrl);
        } else if (isMounted) {
          setImageSrc('data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <rect fill="#FEF3C7" width="100" height="100"/>
              <text x="50" y="55" font-size="30" text-anchor="middle" fill="#B8860B">🏭</text>
            </svg>
          `));
        }
      } catch (error) {
        if (isMounted) {
          setImageSrc('data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <rect fill="#FEF3C7" width="100" height="100"/>
              <text x="50" y="55" font-size="30" text-anchor="middle" fill="#B8860B">🏭</text>
            </svg>
          `));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadImage();
    return () => { isMounted = false; };
  }, [src]);

  if (isLoading) {
    return <div className={`animate-pulse bg-amber-100/50 dark:bg-gray-800 ${className}`} />;
  }

  return <img src={imageSrc || src} alt={alt} className={className} />;
}

// ============================================================
// KOMPONENT: DO'KON QARZDORLIGI KARTOCHKASI
// ============================================================
function DebtCard({ 
  store, 
  debt, 
  phone, 
  onPay 
}: { 
  store: string; 
  debt: number; 
  phone: string; 
  onPay: (storeName: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-amber-300 dark:hover:border-amber-800/80 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/50">
          <Store className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{store}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">{phone}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-2">
        <p className="font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">{formatCurrency(debt)}</p>
        <button 
          onClick={() => onPay(store)}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl transition mt-1 border border-emerald-200/50 cursor-pointer touch-press active:scale-95 inline-flex items-center gap-1"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          To&apos;lov qabul qilish
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ASOSIY KOMPONENT: Super Admin Dashboard
// ============================================================
export default function DashboardPage() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDebts, setShowDebts] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'week' | 'month'>('week');

  // Statistika ma'lumotlari
  const [stats, setStats] = useState({
    monthlyRevenue: 672000000,
    monthlyRevenueChange: 18,
    orders: INITIAL_ORDERS.length || 156,
    ordersChange: 12,
    agents: 12,
    agentsChange: 2,
    stores: INITIAL_STORES.length || 45,
    storesChange: 5,
    totalDebt: 12000000,
    debtsList: [
      { store: 'Korzinka — Chilonzor', debt: 3200000, phone: '+998 90 123 45 67' },
      { store: 'Makro Supermarket — Sergeli', debt: 1800000, phone: '+998 90 123 45 68' },
      { store: 'Havas Diskaunter — Qo\'yliq', debt: 4500000, phone: '+998 90 123 45 69' },
      { store: 'Baraka Qandolat Do\'koni', debt: 2500000, phone: '+998 90 123 45 70' },
    ]
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdate(new Date());
      toast.success("✅ Ma'lumotlar muvaffaqiyatli yangilandi!");
    }, 600);
  };

  const handlePayDebt = (storeName: string) => {
    setStats(prev => {
      const updatedDebts = prev.debtsList.map(d => 
        d.store === storeName ? { ...d, debt: 0 } : d
      );
      const newTotal = updatedDebts.reduce((sum, d) => sum + d.debt, 0);
      return { ...prev, debtsList: updatedDebts, totalDebt: newTotal };
    });
    toast.success(`✅ ${storeName} bo'yicha qarzdorlik to'liq qoplandi!`);
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in-up max-w-7xl mx-auto">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            🏭 Super Admin Panel
            <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Holva Factory boshqaruv markazi · 
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
              Oxirgi yangilanish: {lastUpdate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-press active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Yangilash</span>
          </button>
          
          <Link
            href="/reports"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-amber-500/20 touch-press active:scale-95 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Hisobot</span>
          </Link>
        </div>
      </div>

      {/* 2. Mahsulotlar Fotosuratlari (Dinamik Yuklash) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[
          { src: INITIAL_PRODUCTS[0]?.image_url || 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80', alt: 'Kunjutli Premium Holva', label: 'Kunjutli Premium Holva' },
          { src: INITIAL_PRODUCTS[1]?.image_url || 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80', alt: 'Shokoladli Yong\'oqli Holva', label: 'Shokoladli Yong\'oqli Holva' },
          { src: INITIAL_PRODUCTS[2]?.image_url || 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', alt: 'Pista Mag\'izli Samarqand', label: 'Pista Mag\'izli Samarqand' },
        ].map((img, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-3xl p-3 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-amber-50 dark:bg-gray-800">
              <DynamicImage 
                src={img.src} 
                alt={img.alt}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5">
                <p className="text-white text-sm font-bold">{img.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Statistika Kartochkalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={DollarSign}
          label="Oylik Tushum"
          value={isLoading ? '...' : formatCurrency(stats.monthlyRevenue)}
          change={stats.monthlyRevenueChange}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          isActive={activeStat === 'revenue'}
          onClick={() => setActiveStat(activeStat === 'revenue' ? null : 'revenue')}
        />
        <StatCard
          icon={ShoppingBag}
          label="Jami Buyurtmalar"
          value={isLoading ? '...' : `${stats.orders} ta`}
          change={stats.ordersChange}
          color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          isActive={activeStat === 'orders'}
          onClick={() => setActiveStat(activeStat === 'orders' ? null : 'orders')}
        />
        <StatCard
          icon={Users}
          label="Sotuv Agentlari"
          value={isLoading ? '...' : `${stats.agents} nafar`}
          change={stats.agentsChange}
          color="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
          isActive={activeStat === 'agents'}
          onClick={() => setActiveStat(activeStat === 'agents' ? null : 'agents')}
        />
        <StatCard
          icon={Store}
          label="Faol Do'konlar"
          value={isLoading ? '...' : `${stats.stores} ta`}
          change={stats.storesChange}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          isActive={activeStat === 'stores'}
          onClick={() => setActiveStat(activeStat === 'stores' ? null : 'stores')}
        />
      </div>

      {/* 4. Do'konlar Qarzdorligi Bloki */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Do&apos;konlar Qarzdorligi
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full">
                {stats.debtsList.filter(d => d.debt > 0).length} ta qarzdor
              </span>
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <p className="text-gray-500 dark:text-gray-400">
                Jami qoldiq qarz: <span className="font-black text-amber-600 dark:text-amber-400">{formatCurrency(stats.totalDebt)}</span>
              </p>
              <button 
                onClick={() => setShowDebts(!showDebts)}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {showDebts ? 'Yashirish' : 'Ko\'rsatish'}
              </button>
            </div>
          </div>
          
          <Link href="/stores" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 self-start sm:self-auto">
            Barcha do&apos;konlar <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {showDebts && (
          <div className="space-y-3 pt-2">
            {stats.debtsList.filter(d => d.debt > 0).length === 0 ? (
              <div className="text-center py-8 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-gray-900 dark:text-white font-bold text-sm">Barcha qarzlar to&apos;liq so&apos;ndirilgan! 🎉</p>
                <p className="text-xs text-gray-400 mt-0.5">Hech qaysi do&apos;konda kechiktirilgan to&apos;lov yo&apos;q</p>
              </div>
            ) : (
              stats.debtsList.map((debt, idx) => (
                <DebtCard
                  key={idx}
                  store={debt.store}
                  debt={debt.debt}
                  phone={debt.phone}
                  onPay={handlePayDebt}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 5. Savdo Dinamikasi Grafigi */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Savdo Dinamikasi
            </h3>
            <p className="text-xs text-gray-400">Oxirgi davr tushumlari tahlili</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveChartTab('week')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition ${activeChartTab === 'week' ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-gray-400'}`}
            >
              Hafta
            </button>
            <button 
              onClick={() => setActiveChartTab('month')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition ${activeChartTab === 'month' ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-gray-400'}`}
            >
              Oy
            </button>
          </div>
        </div>

        <div className="flex items-end gap-2 h-36 pt-6 pb-2 px-1 border-b border-gray-100 dark:border-gray-800">
          {[2.8, 3.2, 2.5, 4.1, 3.8, 5.2, 4.5, 3.9, 4.8, 5.6, 6.2, 5.8].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
              <span className="text-[9px] font-bold text-gray-400 group-hover:text-amber-600 transition">
                {val}M
              </span>
              <div 
                className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl transition-all group-hover:from-amber-600 group-hover:to-amber-500 shadow-xs"
                style={{ height: `${(val / 7) * 100}%`, minHeight: '8px' }}
              />
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Suzuvchi AI Yordamchi Tugmasi */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-2xl transition touch-press active:scale-95 flex items-center gap-2.5 cursor-pointer border border-amber-400/40"
      >
        <Bot className="w-5 h-5 lg:w-6 lg:h-6" />
        <span className="font-bold text-xs sm:text-sm">AI Assistant</span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
      </button>

      {/* 7. AI Yordamchi Modali */}
      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
      />

    </div>
  );
}
