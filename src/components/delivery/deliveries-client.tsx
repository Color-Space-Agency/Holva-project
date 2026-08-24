"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeliveryFormDialog } from "./delivery-form-dialog"

export function DeliveriesClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const supabase = createClient()

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ["deliveries", searchQuery],
    queryFn: async () => {
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
      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish (yetkazma raqami)..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yetkazma qo'shish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raqam</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Do'kon</TableHead>
              <TableHead>Haydovchi</TableHead>
              <TableHead>Holat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries?.map((delivery: any) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.delivery_number}</TableCell>
                <TableCell>{formatDate(delivery.delivery_date)}</TableCell>
                <TableCell>{delivery.stores?.name}</TableCell>
                <TableCell>
                  {delivery.profiles ? `${delivery.profiles.first_name} ${delivery.profiles.last_name}` : delivery.driver_name || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{delivery.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {deliveries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeliveryFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
