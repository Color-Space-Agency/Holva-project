'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Search, MapPin, Phone, ShoppingCart, Plus, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_STORES } from '@/lib/mock-data';

export function AgentStores() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState(INITIAL_STORES);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 pb-24 max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur py-2 space-y-3">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mening Do&apos;konlarim</h1>
            <p className="text-xs text-gray-400">Jami {filteredStores.length} ta biriktirilgan savdo nuqtasi</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Do'kon nomi, telefon yoki manzil..."
            className="pl-10 h-11 rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredStores.map((store) => {
          const hasDebt = store.current_balance < 0;
          return (
            <div
              key={store.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                    {store.name}
                  </h3>
                  <div className="text-xs text-gray-400 mt-0.5">{store.contact_person}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      hasDebt
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}
                  >
                    {hasDebt ? `Qarz: ${formatCurrency(Math.abs(store.current_balance))}` : 'Qarz yo\'q'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <a href={`tel:${store.phone}`} className="hover:text-emerald-600 font-medium">
                    {store.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>
              </div>

              {/* Tezkor harakatlar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href={`/agent/orders?new=true&store=${store.id}`} className="w-full">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5 h-9"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Buyurtma olish
                  </Button>
                </Link>
                <Link href={`/agent/visits?store=${store.id}`} className="w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold gap-1.5 h-9"
                  >
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> Tashrif qayd etish
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}

        {filteredStores.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            Qidiruv bo&apos;yicha do&apos;kon topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
