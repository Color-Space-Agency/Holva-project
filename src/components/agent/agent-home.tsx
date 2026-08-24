'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Store, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function AgentHome() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        supabase.from('users').select('first_name, last_name').eq('id', data.user.id).single().then((res) => {
          if (res.data) setUserName(`${res.data.first_name || ''} ${res.data.last_name || ''}`);
        });
      }
    });
  }, [supabase]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['agent-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [ordersRes, visitsRes, storesRes, commissionsRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, created_at').eq('created_by', userId).gte('created_at', `${today}T00:00:00Z`),
        supabase.from('visits').select('id').eq('agent_id', userId).gte('created_at', `${today}T00:00:00Z`),
        supabase.from('agent_store_assignments').select('store_id').eq('agent_id', userId),
        supabase.from('agent_commissions').select('*').eq('agent_id', userId).order('created_at', { ascending: false }).limit(1)
      ]);

      return {
        todayOrders: ordersRes.data?.length || 0,
        todaySales: ordersRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
        todayVisits: visitsRes.data?.length || 0,
        assignedStores: storesRes.data?.length || 0,
        commission: commissionsRes.data?.[0] || null
      };
    }
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['agent-recent-orders', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select(`id, order_number, total_amount, status, created_at, stores (name)`)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="p-4 space-y-4 animate-pulse"><div className="h-10 bg-muted rounded"></div><div className="h-32 bg-muted rounded"></div></div>;
  }

  const currentDate = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'full' }).format(new Date());

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Salom, {userName}</h1>
        <p className="text-muted-foreground">{currentDate}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-6 w-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.todayOrders}</div>
            <div className="text-xs text-muted-foreground">Bugungi sotuvlar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <MapPin className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.todayVisits}</div>
            <div className="text-xs text-muted-foreground">Bugungi tashriflar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Store className="h-6 w-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.assignedStores}</div>
            <div className="text-xs text-muted-foreground">Do'konlar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CreditCard className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-lg font-bold">{formatCurrency(stats?.todaySales || 0)}</div>
            <div className="text-xs text-muted-foreground">Bugungi summa</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bu oydagi komissiya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(stats?.commission?.commission_amount || 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">To'langan: {formatCurrency(stats?.commission?.paid_amount || 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-destructive">Qoldiq: {formatCurrency(stats?.commission?.remaining_amount || 0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1" asChild>
          <Link href="/orders?new=true">Yangi buyurtma</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/visits?new=true">Tashrif boshlash</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">So'nggi buyurtmalar</h3>
          <Link href="/orders" className="text-sm text-primary flex items-center">Barchasi <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="space-y-3">
          {recentOrders?.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">Hali buyurtmalar yo'q</p>
          ) : (
            recentOrders?.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <Link href={`/orders/${order.id}`}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{(order.stores as any)?.name || 'Noma\'lum do\'kon'}</div>
                      <div className="text-sm text-muted-foreground">{order.order_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(Number(order.total_amount))}</div>
                      <div className="text-xs bg-muted px-2 py-1 rounded-full inline-block mt-1">{order.status}</div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
