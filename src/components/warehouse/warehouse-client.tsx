"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isRealSupabaseConfigured, getStoredProducts, getDeletedProductIds, deleteStoredProduct } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, History, ArrowRightLeft, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryItem {
  id: string;
  product_id?: string | null;
  raw_material_id?: string | null;
  item_type: "product" | "material";
  current_stock: number;
  minimum_stock: number;
  reserved_stock: number;
  warehouse: { name: string };
  product?: { name: string } | null;
  raw_material?: { name: string } | null;
  unit: { short_name: string };
}

const STORAGE_KEY_INVENTORY = "holva_crm_stored_inventory";

function getStoredInventoryList(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  const deletedSet = new Set(getDeletedProductIds());

  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: InventoryItem) => {
          const pId = item.product_id;
          const pName = (item.product?.name || "").toLowerCase().trim();
          if (pId && deletedSet.has(pId)) return false;
          if (pName && deletedSet.has(pName)) return false;
          return true;
        });
      }
    }
  } catch (e) {
    console.error("Error reading stored inventory:", e);
  }

  // Generate inventory items only from active (non-deleted) stored products if empty
  const storedProducts = getStoredProducts();
  if (storedProducts.length === 0) return [];

  const initialItems: InventoryItem[] = storedProducts.map((p) => ({
    id: `inv-${p.id}`,
    product_id: p.id,
    raw_material_id: null,
    item_type: "product" as const,
    current_stock: p.stock,
    minimum_stock: p.min_stock,
    reserved_stock: 0,
    warehouse: { name: "Tayyor Mahsulotlar Ombori" },
    product: { name: p.name },
    raw_material: null,
    unit: { short_name: p.unit || "dona" },
  }));

  saveStoredInventoryList(initialItems);
  return initialItems;
}

function saveStoredInventoryList(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("inventory-updated", { detail: { items } }));

    // Sync inventory stock changes back to stored products
    const rawProds = localStorage.getItem("holva_crm_stored_products");
    if (rawProds) {
      const prodsList: any[] = JSON.parse(rawProds);
      let prodsChanged = false;

      items.forEach((item) => {
        const name = (item.product?.name || item.raw_material?.name || "").toLowerCase().trim();
        const pId = item.product_id;
        const found = prodsList.find(
          (p) => (pId && p.id === pId) || (name && p.name.toLowerCase().trim() === name)
        );
        if (found && found.stock !== item.current_stock) {
          found.stock = item.current_stock;
          prodsChanged = true;
        }
      });

      if (prodsChanged) {
        localStorage.setItem("holva_crm_stored_products", JSON.stringify(prodsList));
        window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: prodsList } }));

        fetch("/api/sync/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_all", productsList: prodsList }),
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error("Error saving stored inventory:", e);
  }
}

export function WarehouseClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adjustItem, setAdjustItem] = useState<any>(null);
  
  // Dialog states for Create and Edit
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    };
    window.addEventListener("inventory-updated", handleUpdate);
    window.addEventListener("products-updated", handleUpdate);
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }, 3000);
    return () => {
      window.removeEventListener("inventory-updated", handleUpdate);
      window.removeEventListener("products-updated", handleUpdate);
      clearInterval(interval);
    };
  }, [queryClient]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    item_type: "product" as "product" | "material",
    current_stock: "",
    minimum_stock: "",
    unit: "dona",
    warehouse_name: "Tayyor Mahsulotlar Ombori",
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        const { data } = await supabase.from("warehouses").select("*");
        if (data && data.length > 0) return data;
      }
      return [
        { id: "wh-1", name: "Tayyor Mahsulotlar Ombori" },
        { id: "wh-2", name: "Xomashyo Ombori" },
      ];
    },
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory", warehouseFilter, searchQuery],
    queryFn: async () => {
      let items: InventoryItem[] = [];
      
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("inventory")
            .select(`*, product:products(name), raw_material:raw_materials(name), warehouse:warehouses(name), unit:units(short_name)`);
            
          if (warehouseFilter !== "all") {
            query = query.eq("warehouse_id", warehouseFilter);
          }
          
          const { data } = await query;
          if (data && data.length > 0) {
            items = data as any[];
          }
        } catch {
          // Fallback to local storage
        }
      }

      if (items.length === 0) {
        items = getStoredInventoryList();
      }

      // Apply warehouse filter
      if (warehouseFilter !== "all") {
        items = items.filter((i) => i.warehouse?.name === warehouseFilter);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((i) => {
          const name = i.product?.name || i.raw_material?.name || "";
          return name.toLowerCase().includes(q) || (i.warehouse?.name || "").toLowerCase().includes(q);
        });
      }

      return items;
    },
  });

  const products = inventory?.filter((i) => i.item_type === "product" || i.product_id) || [];
  const rawMaterials = inventory?.filter((i) => i.item_type === "material" || i.raw_material_id) || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const currentList = getStoredInventoryList();
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      product_id: formData.item_type === "product" ? `p-${Date.now()}` : null,
      raw_material_id: formData.item_type === "material" ? `rm-${Date.now()}` : null,
      item_type: formData.item_type,
      current_stock: Number(formData.current_stock) || 0,
      minimum_stock: Number(formData.minimum_stock) || 0,
      reserved_stock: 0,
      warehouse: { name: formData.warehouse_name },
      product: formData.item_type === "product" ? { name: formData.name } : null,
      raw_material: formData.item_type === "material" ? { name: formData.name } : null,
      unit: { short_name: formData.unit },
    };

    const updatedList = [newItem, ...currentList];
    saveStoredInventoryList(updatedList);
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    toast.success("Yangi inventar elementi qo'shildi");

    setFormData({
      name: "",
      item_type: "product",
      current_stock: "",
      minimum_stock: "",
      unit: "kg",
      warehouse_name: "Tayyor Mahsulotlar Ombori",
    });
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    const itemName = item.product?.name || item.raw_material?.name || "";
    setFormData({
      name: itemName,
      item_type: item.item_type || (item.product_id ? "product" : "material"),
      current_stock: String(item.current_stock),
      minimum_stock: String(item.minimum_stock),
      unit: item.unit?.short_name || "kg",
      warehouse_name: item.warehouse?.name || "Tayyor Mahsulotlar Ombori",
    });
    setIsEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formData.name.trim()) return;

    const currentList = getStoredInventoryList();
    const updatedList = currentList.map((i) => {
      if (i.id === editingItem.id) {
        return {
          ...i,
          item_type: formData.item_type,
          current_stock: Number(formData.current_stock) || 0,
          minimum_stock: Number(formData.minimum_stock) || 0,
          unit: { short_name: formData.unit },
          warehouse: { name: formData.warehouse_name },
          product: formData.item_type === "product" ? { name: formData.name } : null,
          raw_material: formData.item_type === "material" ? { name: formData.name } : null,
        };
      }
      return i;
    });

    saveStoredInventoryList(updatedList);
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    toast.success("Inventar elementi tahrirlandi");
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const currentList = getStoredInventoryList();
    const itemToDelete = currentList.find((i) => i.id === id);
    if (itemToDelete) {
      if (itemToDelete.product_id) {
        deleteStoredProduct(itemToDelete.product_id);
      } else if (itemToDelete.product?.name) {
        deleteStoredProduct(itemToDelete.product.name);
      }
    }

    const updatedList = currentList.filter((i) => i.id !== id);
    saveStoredInventoryList(updatedList);
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Inventar elementi o'chirildi");
  };

  const renderTable = (items: InventoryItem[]) => (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
          <TableRow>
            <TableHead className="font-semibold">Nomi</TableHead>
            <TableHead className="font-semibold">Ombor</TableHead>
            <TableHead className="text-right font-semibold">Mavjud (Zaxira)</TableHead>
            <TableHead className="font-semibold">Holat</TableHead>
            <TableHead className="text-right font-semibold">Amallar</TableHead>
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
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                Ma'lumot topilmadi
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const name = item.product?.name || item.raw_material?.name || "Nomsiz mahsulot";
              const isLow = item.current_stock <= (item.minimum_stock || 0);
              const progress = Math.min((item.current_stock / ((item.minimum_stock || 1) * 3)) * 100, 100);
              
              return (
                <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <TableCell className="font-medium flex items-center gap-2">
                    {name}
                    {isLow && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{item.warehouse?.name}</TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={isLow ? "text-red-500 font-bold" : "text-gray-900 dark:text-white"}>
                      {formatNumber(item.current_stock)}
                    </span>
                    {item.reserved_stock > 0 && <span className="text-xs text-gray-400 ml-1">({formatNumber(item.reserved_stock)})</span>}
                    <span className="text-xs text-gray-400 ml-1">{item.unit?.short_name}</span>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <Progress value={progress} className={`h-2 ${isLow ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-600"}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAdjustItem(item)}
                        title="Korrektirovka"
                        className="h-8 w-8 text-violet-600 hover:bg-violet-50 rounded-lg"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        title="Tahrirlash"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        title="O'chirish"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <SelectValue placeholder="Omborni tanlang" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Barcha omborlar</SelectItem>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1 text-xs sm:text-sm">
            <Plus className="h-4 w-4" /> Yangi element
          </Button>

          <Button asChild variant="outline" className="rounded-xl text-xs sm:text-sm gap-1">
            <Link href="/warehouse/movements"><History className="h-4 w-4" /> Tarix</Link>
          </Button>
        </div>
      </div>

      <div className="pt-2">
        {renderTable(products.length > 0 ? products : inventory)}
      </div>
      
      {adjustItem && (
        <StockAdjustmentDialog 
          item={adjustItem} 
          open={!!adjustItem} 
          onOpenChange={(o) => !o && setAdjustItem(null)} 
        />
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yangi Inventar Qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nomi *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Samarqand Xandon Pista Holvasi"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Joriy zaxira *</label>
                <Input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  placeholder="100"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Min. zaxira</label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  placeholder="20"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Birlik</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="dona"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Inventarni Tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nomi *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mahsulot yoki xomashyo nomi"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Joriy zaxira *</label>
                <Input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  placeholder="100"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Min. zaxira</label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  placeholder="20"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Birlik</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="dona"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}