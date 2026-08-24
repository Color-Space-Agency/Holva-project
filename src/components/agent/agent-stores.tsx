'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Search, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export function AgentStores() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  const { data: stores, isLoading } = useQuery({
    queryKey: ['agent-stores', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('agent_store_assignments')
        .select(`
          store_id,
          stores (
            id, name, phone, address, current_balance, status
          )
        `)
        .eq('agent_id', userId);
        
      return data?.map(d => d.stores).filter(Boolean) || [];
    }
  });

  const filteredStores = stores?.filter(s => 
    // @ts-ignore
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    // @ts-ignore
    s.phone?.includes(search)
  ) || [];

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
        <h1 className="text-xl font-bold mb-4">Mening do'konlarim</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Do'kon nomi yoki raqami..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStores.map((store: any) => (
            <Card key={store.id} className="overflow-hidden">
              <Link href={`/stores/${store.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    <span className={`text-sm font-medium ${Number(store.current_balance) < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(Number(store.current_balance))}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
          {filteredStores.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Do'konlar topilmadi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
