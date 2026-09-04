'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredStores } from '@/lib/mock-data';

interface AgentVisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newVisit: any) => void;
}

export function AgentVisitForm({ open, onOpenChange, onSuccess }: AgentVisitFormProps) {
  const storesList = getStoredStores();
  const [storeId, setStoreId] = useState(storesList[0]?.id || '');
  const [purpose, setPurpose] = useState('Sotuv olish');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = storesList.find((s) => s.id === storeId) || storesList[0];

    const newVisit = {
      id: `vis-${Date.now()}`,
      store_name: store?.name || 'Do\'kon',
      address: store?.address || '',
      status: 'IN_PROGRESS' as const,
      start_time: `Bugun ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} (Jarayonda)`,
      duration: 'Hozir boshlandi',
      notes: `${purpose}: ${notes || "Muzokara olib borilmoqda"}`,
    };

    toast.success(`${store?.name || 'Do\'kon'} do'koniga tashrif boshlandi!`);
    onSuccess(newVisit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Navigation className="h-5 w-5 text-emerald-600" />
            Yangi Tashrif Boshlash
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Do&apos;kon / Savdo nuqtasi *
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium"
            >
              {storesList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.address})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Tashrif maqsadi
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="Yangi Sotuv olish">Yangi Sotuv olish</option>
              <option value="Qarzdorlik / to'lov qabul qilish">Qarzdorlik / to&apos;lov qabul qilish</option>
              <option value="Vitrina va qoldiqlarni tekshirish">Vitrina va qoldiqlarni tekshirish</option>
              <option value="Yangi mahsulot taqdimoti">Yangi mahsulot taqdimoti</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Izoh yoki natija
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Menejer bilan yangi assortiment kelishildi"
              className="h-11 rounded-2xl text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-11 text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Check className="h-4 w-4" /> Tashrifni boshlash
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
