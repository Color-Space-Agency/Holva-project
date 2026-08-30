"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { INITIAL_STORES, getStoredOrders } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Search, Store, ArrowRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function AktSverkaClient() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  
  const stores = useMemo(() => INITIAL_STORES, [])

  const { data: storeBalances, isLoading } = useQuery({
    queryKey: ["akt-sverka-balances"],
    queryFn: () => {
      const orders = getStoredOrders()
      
      const balances = stores.map(store => {
        const storeOrders = orders.filter((o: any) => o.stores?.name === store.name || o.store_name === store.name)
        
        let totalDebt = 0
        let totalPaid = 0
        let lastAction = "Yo'q"
        
        storeOrders.forEach(o => {
          totalDebt += (o.total_amount || 0)
          totalPaid += (o.paid_amount || 0)
          if (o.created_at) lastAction = new Date(o.created_at).toLocaleDateString("uz-UZ")
        })
        
        const balance = totalDebt - totalPaid
        
        return {
          id: store.id,
          name: store.name,
          address: store.address,
          balance,
          lastAction,
          totalOrders: storeOrders.length
        }
      })
      
      return balances
    }
  })

  const filtered = storeBalances?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Do'konni qidirish..."
            className="pl-8 bg-white dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-gray-500">Yuklanmoqda...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">Mijozlar topilmadi</p>
        ) : (
          filtered.map(store => (
            <div 
              key={store.id}
              onClick={() => router.push(`/akt-sverka/${store.id}`)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors">
                    <Store className="w-5 h-5 text-gray-500 group-hover:text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">{store.name}</h3>
                    <p className="text-xs text-gray-500">{store.address}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transform group-hover:translate-x-1 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Oxirgi harakat:</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{store.lastAction}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Joriy Holat:</span>
                  {store.balance > 0 ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 px-2 py-0.5">
                      <AlertCircle className="w-3 h-3" />
                      Qarz: {formatCurrency(store.balance)}
                    </Badge>
                  ) : store.balance < 0 ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 px-2 py-0.5">
                      <TrendingUp className="w-3 h-3" />
                      Haqdor: {formatCurrency(Math.abs(store.balance))}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1 px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Qarz yo&apos;q
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
