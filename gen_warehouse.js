const fs = require('fs');
const path = require('path');

const files = {
  "src/app/(admin)/warehouse/page.tsx": `import { WarehouseClient } from "@/components/warehouse/warehouse-client";

export default function WarehousePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ombor (Inventar)</h2>
      </div>
      <WarehouseClient />
    </div>
  );
}`,
  
  "src/components/warehouse/warehouse-client.tsx": `"use client";

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

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory", warehouseFilter],
    queryFn: async () => {
      let query = supabase
        .from("inventory")
        .select(\`*, product:products(name), raw_material:raw_materials(name), warehouse:warehouses(name), unit:units(short_name)\`);
        
      if (warehouseFilter !== "all") {
        query = query.eq("warehouse_id", warehouseFilter);
      }
      
      const { data } = await query;
      return data || [];
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
            <TableHead className="text-right">Harakatlar</TableHead>
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
                    <Progress value={progress} className={\`h-2 \${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}\`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setAdjustItem(item)} title="Korrektirovka">
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
}`,

  "src/components/warehouse/stock-adjustment-dialog.tsx": `"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/audit";

const formSchema = z.object({
  movement_type: z.enum(["IN", "OUT", "ADJUSTMENT", "WASTE"]),
  quantity: z.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
  reason: z.string().optional()
});

export function StockAdjustmentDialog({ item, open, onOpenChange }: { item: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movement_type: "ADJUSTMENT",
      quantity: 0,
      reason: ""
    }
  });

  const movementType = form.watch("movement_type");
  const qty = form.watch("quantity") || 0;
  
  let newStock = item?.current_stock || 0;
  if (movementType === "IN") newStock += qty;
  else if (movementType === "OUT" || movementType === "WASTE") newStock -= qty;
  // For ADJUSTMENT, we could interpret it as exact stock or offset, let's treat it as setting exact stock or adding/subtracting?
  // Often adjustment means replacing. Let's make "quantity" the DIFFERENCE for simplicity, or just use IN/OUT/WASTE.
  else if (movementType === "ADJUSTMENT") newStock = qty; // If ADJUSTMENT, user sets absolute new stock

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      let finalNewStock = item.current_stock;
      if (values.movement_type === "IN") finalNewStock += values.quantity;
      else if (values.movement_type === "OUT" || values.movement_type === "WASTE") finalNewStock -= values.quantity;
      else if (values.movement_type === "ADJUSTMENT") finalNewStock = values.quantity;

      if (finalNewStock < 0) {
        throw new Error("Ombordagi zaxira manfiy bo'lishi mumkin emas!");
      }

      // We need to calculate the actual diff for the movement log
      const diff = finalNewStock - item.current_stock;

      const { data: userResp } = await supabase.auth.getUser();
      
      const { error: moveError } = await supabase.from("inventory_movements").insert({
        inventory_id: item.id,
        movement_type: values.movement_type,
        quantity: Math.abs(diff), // absolute quantity moved
        before_stock: item.current_stock,
        after_stock: finalNewStock,
        reason: values.reason,
        created_by: userResp.user?.id
      });
      if (moveError) throw moveError;

      const { error: invError } = await supabase.from("inventory").update({
        current_stock: finalNewStock
      }).eq("id", item.id);
      if (invError) throw invError;

      await createAuditLog({ action: "UPDATE", tableName: "inventory", recordId: item.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Zaxira yangilandi");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (!item) return null;
  const itemName = item.product?.name || item.raw_material?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zaxirani tahrirlash: {itemName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="bg-muted p-3 rounded-md flex justify-between">
            <span className="text-sm">Joriy zaxira:</span>
            <span className="font-bold">{item.current_stock} {item.unit?.short_name}</span>
          </div>

          <div className="space-y-2">
            <Label>Amaliyot turi</Label>
            <Select onValueChange={(v: any) => form.setValue("movement_type", v)} defaultValue="ADJUSTMENT">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Kirim (IN)</SelectItem>
                <SelectItem value="OUT">Chiqim (OUT)</SelectItem>
                <SelectItem value="WASTE">Yaroqsiz/Chiqindi (WASTE)</SelectItem>
                <SelectItem value="ADJUSTMENT">To'g'rilash (Absolute stock)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{movementType === 'ADJUSTMENT' ? 'Yangi aniq qoldiq' : 'Miqdor'}</Label>
            <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
          </div>

          <div className="bg-muted/50 p-3 rounded-md flex justify-between">
            <span className="text-sm">Yangi qoldiq:</span>
            <span className={\`font-bold \${newStock < 0 ? 'text-destructive' : ''}\`}>{newStock} {item.unit?.short_name}</span>
          </div>

          <div className="space-y-2">
            <Label>Sabab / Izoh</Label>
            <Textarea {...form.register("reason")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}`,

  "src/app/(admin)/warehouse/movements/page.tsx": `import { MovementsClient } from "@/components/warehouse/movements-client";

export default function MovementsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Harakatlar tarixi</h2>
      </div>
      <MovementsClient />
    </div>
  );
}`,

  "src/components/warehouse/movements-client.tsx": `"use client";

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
        .select(\`
          *,
          inventory!inner(
            product:products(name),
            raw_material:raw_materials(name),
            unit:units(short_name)
          ),
          user:profiles(full_name)
        \`)
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
}`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(process.cwd(), filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filepath);
});
