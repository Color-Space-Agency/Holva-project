'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface AgentOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function AgentOrderForm({ open, onOpenChange, userId }: AgentOrderFormProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [storeId, setStoreId] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number, price: number, discount: number }[]>([]);
  const [notes, setNotes] = useState('');

  const { data: stores } = useQuery({
    queryKey: ['agent-stores', userId],
    queryFn: async () => {
      const { data } = await supabase.from('agent_store_assignments').select('store_id, stores(id, name)').eq('agent_id', userId);
      return data?.map(d => d.stores).filter(Boolean) || [];
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, name, price').eq('status', 'ACTIVE');
      return data || [];
    }
  });

  const addProduct = () => {
    if (products && products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1, price: Number(products[0].price), discount: 0 }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products?.find(p => p.id === value);
      if (product) {
        newItems[index] = { ...newItems[index], productId: value, price: Number(product.price) };
      }
    } else {
      // @ts-ignore
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalDiscount = items.reduce((sum, item) => sum + Number(item.discount), 0);
  const total = subtotal - totalDiscount;

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error('Dokon tanlanmagan');
      if (items.length === 0) throw new Error('Mahsulot qo\'shilmagan');

      const { data: storeData } = await supabase.from('stores').select('factory_id').eq('id', storeId).single();
      if (!storeData) throw new Error('Factory topilmadi');

      const { data: order, error } = await supabase.from('orders').insert({
        factory_id: storeData.factory_id,
        store_id: storeId,
        created_by: userId,
        status: 'CONFIRMED',
        total_amount: total,
        order_number: `ORD-${Date.now().toString().slice(-6)}`
      }).select().single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      toast.success('Buyurtma yaratildi');
      queryClient.invalidateQueries({ queryKey: ['agent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      onOpenChange(false);
      setStoreId('');
      setItems([]);
      setNotes('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  });

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-background rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            <div className="flex justify-between items-center mb-4">
              <Drawer.Title className="text-xl font-bold">Yangi buyurtma</Drawer.Title>
              <Drawer.Close asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4"/></Button>
              </Drawer.Close>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Do'kon</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Do'konni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Mahsulotlar</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                    <Plus className="h-3 w-3 mr-1" /> Qo'shish
                  </Button>
                </div>
                
                {items.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg border-dashed">
                    Mahsulotlar yo'q
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="border p-3 rounded-lg space-y-3 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <div className="pr-6">
                          <Select value={item.productId} onValueChange={(v) => updateItem(index, 'productId', v)}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label className="text-xs">Miqdor</Label>
                            <div className="flex items-center gap-1 mt-1">
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}><Minus className="h-3 w-3"/></Button>
                              <Input type="number" className="h-8 text-center" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} />
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(index, 'quantity', item.quantity + 1)}><Plus className="h-3 w-3"/></Button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Chegirma</Label>
                            <Input type="number" className="h-8" value={item.discount} onChange={(e) => updateItem(index, 'discount', Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="text-right text-sm font-medium">
                          {formatCurrency((item.quantity * item.price) - item.discount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Eslatma</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Buyurtma uchun izoh..." />
              </div>

              <div className="border-t pt-4 mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jami:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chegirma:</span>
                  <span className="text-destructive">-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>To'lanadigan summa:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                size="lg" 
                onClick={() => createOrder.mutate()} 
                disabled={createOrder.isPending || items.length === 0 || !storeId}
              >
                {createOrder.isPending ? 'Saqlanmoqda...' : 'Tasdiqlash'}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
