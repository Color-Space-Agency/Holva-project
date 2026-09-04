"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, History, ArrowRightLeft } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function WarehouseClient() {
  const supabase = createClient();
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [adjustItem, setAdjustItem] = useState<any>(null);

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data } = await supabase.from("warehouses").select("*");
      return data || [];
    }
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory", warehouseFilter],
    queryFn: async () => {
      const { isRealSupabaseConfigured, getStoredProducts } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("inventory")
            .select(`*, product:products(name), raw_material:raw_materials(name), warehouse:warehouses(name), unit:units(short_name)`);
            
          if (warehouseFilter !== "all") {
            query = query.eq("warehouse_id", warehouseFilter);
          }
          
          const { data } = await query;
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }

      const storedProducts = getStoredProducts();
      const productItems = storedProducts.map((p) => ({
        id: `inv-${p.id}`,
        product_id: p.id,
        raw_material_id: null,
        current_stock: p.stock,
        minimum_stock: p.min_stock,
        reserved_stock: 0,
        warehouse: { name: "Tayyor Mahsulotlar Ombori" },
        product: { name: p.name },
        raw_material: null,
        unit: { short_name: p.unit },
      }));

      return productItems;
    }
  });

  const products = inventory?.filter(i => i.product_id) || [];
  const rawMaterials = inventory?.filter(i => i.raw_material_id) || [];

  const renderTable = (items: any[]) => (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomi</TableHead>
            <TableHead>Ombor</TableHead>
            <TableHead className="text-right">Mavjud (Zaxira)</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Ma'lumot topilmadi</TableCell>
            </TableRow>
          ) : (
            items.map(item => {
              const name = item.product?.name || item.raw_material?.name;
              const isLow = item.current_stock <= (item.minimum_stock || 0);
              const progress = Math.min((item.current_stock / ((item.minimum_stock || 1) * 3)) * 100, 100);
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {name}
                    {isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  </TableCell>
                  <TableCell>{item.warehouse?.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={isLow ? "text-destructive font-bold" : ""}>
                      {formatNumber(item.current_stock)}
                    </span>
                    {item.reserved_stock > 0 && <span className="text-xs text-muted-foreground ml-1">({formatNumber(item.reserved_stock)})</span>}
                    <span className="text-xs text-muted-foreground ml-1">{item.unit?.short_name}</span>
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <Progress value={progress} className={`h-2 ${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setAdjustItem(item)} title="Korrektirovka" aria-label="Qoldiqni korrektirovka qilish">
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Omborni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha omborlar</SelectItem>
            {warehouses?.map(w => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button asChild variant="outline">
          <Link href="/warehouse/movements"><History className="mr-2 h-4 w-4" /> Tarix</Link>
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Tayyor mahsulotlar</TabsTrigger>
          <TabsTrigger value="materials">Xomashyo</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="pt-4">
          {renderTable(products)}
        </TabsContent>
        <TabsContent value="materials" className="pt-4">
          {renderTable(rawMaterials)}
        </TabsContent>
      </Tabs>
      
      {adjustItem && (
        <StockAdjustmentDialog 
          item={adjustItem} 
          open={!!adjustItem} 
          onOpenChange={(o) => !o && setAdjustItem(null)} 
        />
      )}
    </div>
  );
}