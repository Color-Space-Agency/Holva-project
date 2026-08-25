'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Clock, MapPin, CheckCircle2, Navigation, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentVisitForm } from './agent-visit-form';
import { toast } from 'sonner';
import { 
  getStoredVisits, 
  saveStoredVisits, 
  completeStoredVisit, 
  MockVisit 
} from '@/lib/mock-data';

export function AgentVisits() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visits, setVisits] = useState<MockVisit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setVisits(getStoredVisits());
  }, []);

  const handleVisitCreated = (newVisit: MockVisit) => {
    const updated = [newVisit, ...visits];
    setVisits(updated);
    saveStoredVisits(updated);
    setIsFormOpen(false);
  };

  const handleCompleteVisit = (id: string) => {
    const { visits: updatedVisits } = completeStoredVisit(id);
    setVisits(updatedVisits);
    toast.success("✅ Tashrif muvaffaqiyatli yakunlandi va tizimda saqlandi!");
  };

  return (
    <div className="p-4 space-y-4 pb-24 max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur py-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/agent/home')}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-all cursor-pointer shadow-sm touch-press"
              title="Bosh sahifaga qaytish"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tashriflarim</h1>
              <p className="text-xs text-gray-400">Kunlik savdo nuqtalarini aylanib chiqish</p>
            </div>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-md shadow-emerald-500/20 cursor-pointer touch-press"
          >
            <Plus className="h-4 w-4" /> Yangi tashrif
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {visit.store_name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{visit.address}</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${
                  visit.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : visit.status === 'IN_PROGRESS'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 animate-pulse border border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {visit.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                {visit.status === 'IN_PROGRESS' && <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                {visit.status === 'COMPLETED'
                  ? 'Tugallandi'
                  : visit.status === 'IN_PROGRESS'
                  ? 'Jarayonda'
                  : 'Rejalashtirilgan'}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl text-xs space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {visit.start_time}
                </span>
                <span>Davomiyligi: {visit.duration}</span>
              </div>
              {visit.notes && <p className="pt-1 text-gray-700 dark:text-gray-200">{visit.notes}</p>}
            </div>

            {visit.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => handleCompleteVisit(visit.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 gap-1.5 cursor-pointer touch-press shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="h-4 w-4" /> Tashrifni yakunlash
              </Button>
            )}
          </div>
        ))}
      </div>

      <AgentVisitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleVisitCreated}
      />
    </div>
  );
}

export default AgentVisits;
