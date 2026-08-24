'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { AgentVisitForm } from './agent-visit-form';
import { useSearchParams } from 'next/navigation';

export function AgentVisits() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const { data: visits, isLoading } = useQuery({
    queryKey: ['agent-visits', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('visits')
        .select('id, store_id, status, start_time, end_time, notes, created_at, stores (name, address)')
        .eq('agent_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500 bg-green-500/10';
      case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10';
      case 'PLANNED': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getDuration = (start: string, end: string | null) => {
    if (!end) return '-';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.floor((e - s) / 60000); // minutes
    return `${diff} daq`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">Tashriflar</h1>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Boshlash
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)
        ) : visits?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Tashriflar topilmadi</div>
        ) : (
          visits?.map(visit => (
            <Card key={visit.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{(visit.stores as any)?.name}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${getStatusColor(visit.status)}`}>
                    {visit.status === 'IN_PROGRESS' ? 'Jarayonda' : visit.status === 'COMPLETED' ? 'Yakunlangan' : visit.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(visit.start_time || visit.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                    {visit.status === 'COMPLETED' && (
                      <>
                        <span className="mx-1">-</span>
                        <span>{visit.end_time ? new Date(visit.end_time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">Davomiylik: {getDuration(visit.start_time, visit.end_time)}</span>
                      </>
                    )}
                  </div>
                  {visit.notes && (
                    <div className="flex items-start gap-2 pt-1 border-t mt-2">
                      <span className="text-foreground">{visit.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AgentVisitForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        userId={userId || ''} 
      />
    </div>
  );
}
