'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Camera, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

interface AgentVisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function AgentVisitForm({ open, onOpenChange, userId }: AgentVisitFormProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [storeId, setStoreId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: stores } = useQuery({
    queryKey: ['agent-stores', userId],
    queryFn: async () => {
      const { data } = await supabase.from('agent_store_assignments').select('store_id, stores(id, name)').eq('agent_id', userId);
      return data?.map(d => d.stores).filter(Boolean) || [];
    }
  });

  const { data: activeVisit } = useQuery({
    queryKey: ['active-visit', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('visits')
        .select('*, stores(name)')
        .eq('agent_id', userId)
        .eq('status', 'IN_PROGRESS')
        .single();
      return data || null;
    }
  });

  const startVisit = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error('Do\'kon tanlanmagan');
      
      const { data: storeData } = await supabase.from('stores').select('factory_id').eq('id', storeId).single();
      if (!storeData) throw new Error('Factory topilmadi');

      const { error } = await supabase.from('visits').insert({
        factory_id: storeData.factory_id,
        agent_id: userId,
        store_id: storeId,
        status: 'IN_PROGRESS',
        start_time: new Date().toISOString(),
        notes: notes
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tashrif boshlandi');
      queryClient.invalidateQueries({ queryKey: ['active-visit'] });
      queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
      setStoreId('');
      setNotes('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  });

  const endVisit = useMutation({
    mutationFn: async () => {
      if (!activeVisit) return;
      
      const { error } = await supabase
        .from('visits')
        .update({
          status: 'COMPLETED',
          end_time: new Date().toISOString(),
          notes: notes ? `${activeVisit.notes ? activeVisit.notes + '\n' : ''}${notes}` : activeVisit.notes
        })
        .eq('id', activeVisit.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tashrif yakunlandi');
      queryClient.invalidateQueries({ queryKey: ['active-visit'] });
      queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
      onOpenChange(false);
      setNotes('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  });

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-background rounded-t-[10px] pb-8">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            <div className="flex justify-between items-center mb-6">
              <Drawer.Title className="text-xl font-bold">
                {activeVisit ? 'Faol tashrif' : 'Yangi tashrif'}
              </Drawer.Title>
              <Drawer.Close asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4"/></Button>
              </Drawer.Close>
            </div>

            {activeVisit ? (
              <div className="space-y-6">
                <div className="bg-blue-500/10 text-blue-600 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80">Do'kon</div>
                    <div className="font-bold text-lg">{activeVisit.stores?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">Boshlandi</div>
                    <div className="font-bold">{new Date(activeVisit.start_time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div>
                  <Label>Yakuniy eslatmalar</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Tashrif xulosasi..." 
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {}}>
                    <Camera className="h-4 w-4 mr-2" /> Rasm
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={() => endVisit.mutate()}
                    disabled={endVisit.isPending}
                  >
                    <Square className="h-4 w-4 mr-2" /> 
                    {endVisit.isPending ? 'Yakunlanmoqda...' : 'Yakunlash'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label>Do'kon</Label>
                  <Select value={storeId} onValueChange={setStoreId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Do'konni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Maqsad / Eslatma</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Tashrif maqsadi..." 
                    className="mt-2"
                  />
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  size="lg" 
                  onClick={() => startVisit.mutate()}
                  disabled={startVisit.isPending || !storeId}
                >
                  <Play className="h-4 w-4 mr-2" /> 
                  {startVisit.isPending ? 'Boshlanmoqda...' : 'Tashrifni boshlash'}
                </Button>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
