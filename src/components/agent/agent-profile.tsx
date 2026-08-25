'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, LogOut, Wallet, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { LogoutDialog } from '@/components/shared/logout-dialog';

export function AgentProfile() {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="p-4 space-y-6 pb-24 max-w-md mx-auto">
      <div className="text-center pt-6 pb-2">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full mx-auto flex items-center justify-center mb-3 border-2 border-emerald-500/30">
          <User className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sardor Rahimov</h1>
        <div className="text-emerald-700 dark:text-emerald-300 mt-1 bg-emerald-50 dark:bg-emerald-950/40 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/50">
          <ShieldCheck className="h-3.5 w-3.5" /> Rasmiy Savdo Agenti
        </div>
      </div>

      {/* Komissiya & KPI qisqartirilgan kartochkasi */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase">Joriy Oy Komissiyasi</span>
          <p className="text-base font-bold text-emerald-600">{formatCurrency(4725000)}</p>
          <span className="text-[10px] text-emerald-500 font-medium">5% umumiy sotuvdan</span>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase">Oy Savdosi</span>
          <p className="text-base font-bold text-violet-600">{formatCurrency(94500000)}</p>
          <span className="text-[10px] text-gray-400 font-medium">Reja: 118%</span>
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-400">Bog&apos;lanish telefoni</div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white">+998 93 345 67 89</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-blue-500 font-bold w-4 text-center text-sm">@</span>
            <div>
              <div className="text-xs text-gray-400">Telegram</div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white">@sardor_holva</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-violet-600" /> Oxirgi 3 oylik komissiyalar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            <div className="p-3.5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Avgust 2026</div>
                <div className="text-gray-400">Savdo: {formatCurrency(94500000)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600">{formatCurrency(4725000)}</div>
                <div className="text-gray-400">To&apos;langan</div>
              </div>
            </div>
            <div className="p-3.5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Iyul 2026</div>
                <div className="text-gray-400">Savdo: {formatCurrency(86000000)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600">{formatCurrency(4300000)}</div>
                <div className="text-gray-400">To&apos;langan</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chiqish tugmasi */}
      <Button
        variant="outline"
        onClick={() => setLogoutOpen(true)}
        className="w-full h-11 border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-sm font-semibold gap-2 mt-4 cursor-pointer"
      >
        <LogOut className="h-4 w-4" /> Hisobdan chiqish
      </Button>

      {/* Chiqish Tasdiqlash Modali */}
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}
