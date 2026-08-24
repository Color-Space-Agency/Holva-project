"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import * as Papa from "papaparse";

export function MovementsClient() {
  const supabase = createClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: movements, isLoading } = useQuery({
    queryKey: ["inventory_movements", typeFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("inventory_movements")
        .select(`
          *,
          inventory!inner(
            product:products(name),
            raw_material:raw_materials(name),
            unit:units(short_name)
          ),
          user:profiles(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (typeFilter !== "all") {
        query = query.eq("movement_type", typeFilter);
      }
      
      const { data } = await query;
      
      if (search && data) {
        return data.filter(m => {
          const inv: any = m.inventory;
          const name = inv.product?.name || inv.raw_material?.name || "";
          return name.toLowerCase().includes(search.toLowerCase());
        });
      }
      return data || [];
    }
  });

  const exportCsv = () => {
    if (!movements) return;
    const csvData = movements.map(m => {
      const inv: any = m.inventory;
      const name = inv.product?.name || inv.raw_material?.name || "";
      return {
        Sana: new Date(m.created_at).toLocaleString(),
        Mahsulot: name,
        Tur: m.movement_type,
        Miqdor: m.quantity,
        Birlik: inv.unit?.short_name,
        Eski_qoldiq: m.before_stock,
        Yangi_qoldiq: m.after_stock,
        Xodim: (m.user as any)?.full_name || "Tizim",
        Izoh: m.reason || ""
      };
    });
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ombor_harakatlari.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "IN": return <Badge className="bg-green-500">Kirim</Badge>;
      case "OUT": return <Badge variant="secondary">Chiqim</Badge>;
      case "WASTE": return <Badge variant="destructive">Chiqindi</Badge>;
      case "ADJUSTMENT": return <Badge variant="outline">Korrektirovka</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Mahsulot/Xomashyo bo'yicha izlash..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="IN">Kirim</SelectItem>
            <SelectItem value="OUT">Chiqim</SelectItem>
            <SelectItem value="WASTE">Yaroqsiz/Chiqindi</SelectItem>
            <SelectItem value="ADJUSTMENT">Korrektirovka</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportCsv} variant="outline" className="ml-auto" disabled={!movements?.length}>
          <Download className="mr-2 h-4 w-4" /> CSV Yuklash
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sana</TableHead>
              <TableHead>Mahsulot / Xomashyo</TableHead>
              <TableHead>Tur</TableHead>
              <TableHead className="text-right">Miqdor</TableHead>
              <TableHead className="text-center">Qoldiq o'zgarishi</TableHead>
              <TableHead>Xodim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                </TableRow>
              ))
            ) : movements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Ma'lumot topilmadi</TableCell>
              </TableRow>
            ) : (
              movements?.map(m => {
                const inv: any = m.inventory;
                const name = inv.product?.name || inv.raw_material?.name;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm">{new Date(m.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{getTypeBadge(m.movement_type)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {m.movement_type === "IN" ? "+" : m.movement_type === "ADJUSTMENT" ? "" : "-"}
                      {formatNumber(m.quantity)} {inv.unit?.short_name}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatNumber(m.before_stock)} &rarr; {formatNumber(m.after_stock)}
                    </TableCell>
                    <TableCell className="text-sm">{(m.user as any)?.full_name || "Tizim"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}