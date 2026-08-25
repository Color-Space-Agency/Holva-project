"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { isRealSupabaseConfigured } from "@/lib/mock-data"
import { Plus, Search, Truck, MapPin, User, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { DeliveryFormDialog } from "./delivery-form-dialog"

interface DeliveryItem {
  id: string
  delivery_number: string
  store_name: string
  driver_name: string
  vehicle_info: string
  total_amount: number
  delivery_date: string
  status: "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
}

const DEFAULT_DELIVERIES: DeliveryItem[] = [
  {
    id: "del-1",
    delivery_number: "DEL-2026-0089",
    store_name: "Korzinka — Chilonzor filiali",
    driver_name: "Shavkat Ergashev",
    vehicle_info: "Labo (01 450 TAA)",
    total_amount: 14800000,
    delivery_date: "25.08.2026",
    status: "DELIVERED",
  },
  {
    id: "del-2",
    delivery_number: "DEL-2026-0090",
    store_name: "Makro Supermarket — Buyuk Ipak Yo'li",
    driver_name: "Shavkat Ergashev",
    vehicle_info: "Labo (01 450 TAA)",
    total_amount: 9200000,
    delivery_date: "25.08.2026",
    status: "DELIVERED",
  },
  {
    id: "del-3",
    delivery_number: "DEL-2026-0091",
    store_name: "Havas Discounter — Yunusobod",
    driver_name: "Jasur Bekmirzayev",
    vehicle_info: "Damas (01 882 BBA)",
    total_amount: 21500000,
    delivery_date: "25.08.2026",
    status: "OUT_FOR_DELIVERY",
  },
  {
    id: "del-4",
    delivery_number: "DEL-2026-0092",
    store_name: "Baraka Qandolat Do'koni",
    driver_name: "Jasur Bekmirzayev",
    vehicle_info: "Damas (01 882 BBA)",
    total_amount: 4600000,
    delivery_date: "25.08.2026",
    status: "PREPARING",
  },
  {
    id: "del-5",
    delivery_number: "DEL-2026-0093",
    store_name: "Shirin Dunyo Savdo Markazi",
    driver_name: "Otabek Komilov",
    vehicle_info: "Isuzu Furgon (30 112 AAB)",
    total_amount: 18400000,
    delivery_date: "26.08.2026",
    status: "PENDING",
  },
]

export function DeliveriesClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const supabase = createClient()

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries", searchQuery],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("deliveries")
            .select(`
              *,
              stores(name),
              profiles:driver_id(first_name, last_name)
            `)
            .order("created_at", { ascending: false })

          if (searchQuery) {
            query = query.or(`delivery_number.ilike.%${searchQuery}%`)
          }

          const { data, error } = await query
          if (data && data.length > 0) return data as any[]
        } catch {
          // Fallback
        }
      }

      // Instant 0ms fallback
      let res = DEFAULT_DELIVERIES
      if (searchQuery) {
        res = res.filter(
          (d) =>
            d.delivery_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return res
    },
  })

  const getStatusBadge = (status: DeliveryItem["status"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Yetkazildi
          </Badge>
        )
      case "OUT_FOR_DELIVERY":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 gap-1 font-medium animate-pulse">
            <Truck className="h-3 w-3" /> Yo&apos;lda
          </Badge>
        )
      case "PREPARING":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 gap-1 font-medium">
            <Clock className="h-3 w-3" /> Yuklanmoqda
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 gap-1 font-medium">
            <Clock className="h-3 w-3" /> Kutilmoqda
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 gap-1 font-medium">
            <AlertCircle className="h-3 w-3" /> Bekor qilindi
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-violet-600" />
            Yetkazib Berish & Logistika
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Do&apos;konlarga mahsulot tarqatish, haydovchilar va mashinalar yo&apos;nalishi
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Yangi yetkazma
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Raqam, do'kon yoki haydovchi bo'yicha qidirish..."
          className="pl-10 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Yetkazma #</th>
                <th className="px-5 py-3.5 font-semibold">Do&apos;kon (Manzil)</th>
                <th className="px-5 py-3.5 font-semibold">Haydovchi & Avto</th>
                <th className="px-5 py-3.5 font-semibold">Yetkazish Sanasi</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold text-right">Yuk Qiymati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {deliveries.map((del: any) => (
                <tr key={del.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 font-mono font-medium text-violet-600 text-xs">
                    {del.delivery_number}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {del.stores?.name || del.store_name}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {del.driver_name || `${del.profiles?.first_name || ''} ${del.profiles?.last_name || ''}`}
                    </div>
                    <div className="text-gray-400 mt-0.5">{del.vehicle_info}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {del.delivery_date}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(del.status)}</td>
                  <td className="px-5 py-4 font-bold text-right text-gray-900 dark:text-white text-base">
                    {formatCurrency(del.total_amount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => setIsFormOpen(false)}
      />
    </div>
  )
}
