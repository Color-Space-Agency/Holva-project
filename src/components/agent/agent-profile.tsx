'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, LogOut, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AgentProfile() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['agent-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      return data;
    }
  });

  const { data: commissions } = useQuery({
    queryKey: ['agent-commissions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('agent_commissions')
        .select('*')
        .eq('agent_id', userId)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) return <div className="p-4 space-y-4 animate-pulse"><div className="h-32 bg-muted rounded-lg"></div></div>;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center pt-8 pb-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{profile?.first_name} {profile?.last_name}</h1>
        <div className="text-muted-foreground mt-1 bg-muted inline-block px-3 py-1 rounded-full text-sm">
          Savdo Agenti
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Telefon</div>
              <div className="font-medium">{profile?.phone || 'Kiritilmagan'}</div>
            </div>
          </div>
          {profile?.telegram_id && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <span className="text-blue-500 font-bold w-5 text-center text-lg">@</span>
              <div>
                <div className="text-sm text-muted-foreground">Telegram</div>
                <div className="font-medium">{profile.telegram_id}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Komissiya tarixi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {commissions?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Tarix yo'q</div>
            ) : (
              commissions?.map(comm => (
                <div key={comm.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{comm.period_month}-{comm.period_year}</div>
                    <div className="text-xs text-muted-foreground">
                      Savdo: {formatCurrency(Number(comm.total_sales))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatCurrency(Number(comm.commission_amount))}</div>
                    <div className="text-xs">
                      To'langan: {formatCurrency(Number(comm.paid_amount))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full mt-8" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" /> Tizimdan chiqish
      </Button>
    </div>
  );
}
