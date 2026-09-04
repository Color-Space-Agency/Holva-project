'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { INITIAL_PRODUCTS, INITIAL_STORES } from '@/lib/mock-data';

interface AgentOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newOrder: any) => void;
}

export function AgentOrderForm({ open, onOpenChange, onSuccess }: AgentOrderFormProps) {
  const [storeId, setStoreId] = useState(INITIAL_STORES[0]?.id || '');
  const [cart, setCart] = useState<{ productId: string; quantity: number; price: number }[]>([
    { productId: INITIAL_PRODUCTS[0]?.id || '', quantity: 10, price: INITIAL_PRODUCTS[0]?.price || 38000 },
  ]);
  const [discount, setDiscount] = useState<string>('0');
  const [notes, setNotes] = useState('');

  const handleAddProduct = (prodId: string) => {
    const existing = cart.find((c) => c.productId === prodId);
    if (existing) {
      setCart(cart.map((c) => (c.productId === prodId ? { ...c, quantity: c.quantity + 5 } : c)));
    } else {
      const prod = INITIAL_PRODUCTS.find((p) => p.id === prodId);
      if (prod) {
        setCart([...cart, { productId: prod.id, quantity: 5, price: prod.price }]);
      }
    }
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      setCart(cart.map((item, i) => (i === index ? { ...item, quantity: newQty } : item)));
    }
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Iltimos, kamida 1 ta mahsulot tanlang!');
      return;
    }

    const selectedStore = INITIAL_STORES.find((s) => s.id === storeId) || INITIAL_STORES[0];

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: `HLV-2026-00${Math.floor(Math.random() * 900 + 100)}`,
      store_name: selectedStore.name,
      agent_name: 'Sardor Rahimov',
      total_amount: total,
      paid_amount: 0,
      status: 'CONFIRMED',
      payment_status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    toast.success(`Sotuv ${newOrder.order_number} muvaffaqiyatli rasmiylashtirildi!`);
    onSuccess(newOrder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            Yangi Sotuv Olish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Do'kon tanlash */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Mijoz / Do&apos;konni tanlang *
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium"
            >
              {INITIAL_STORES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.address})
                </option>
              ))}
            </select>
          </div>

          {/* Mahsulotlar katalogi (tezkor qo'shish) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Mahsulotlar katalogidan qo&apos;shish:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {INITIAL_PRODUCTS.map((prod) => (
                <button
                  type="button"
                  key={prod.id}
                  onClick={() => handleAddProduct(prod.id)}
                  className="flex items-center justify-between p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-emerald-500 text-left transition-all text-xs cursor-pointer"
                >
                  <div className="truncate mr-1">
                    <div className="font-semibold truncate">{prod.name.split('(')[0]}</div>
                    <div className="text-[10px] text-gray-400">{formatCurrency(prod.price)}</div>
                  </div>
                  <Plus className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Tanlangan mahsulotlar savatchasi */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Tanlangan tovarlar ({cart.length})</span>
              <span className="text-[11px] text-gray-400 font-normal">Dona / kg</span>
            </label>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        {product?.name || 'Mahsulot'}
                      </div>
                      <div className="text-[10px] text-gray-400">{formatCurrency(item.price)}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        min="1"
                        className="w-14 h-7 text-center text-xs font-black p-0 border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/30 rounded-lg text-gray-900 dark:text-white"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleUpdateQty(idx, e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                        onBlur={() => { if (!item.quantity || item.quantity <= 0) handleUpdateQty(idx, 1) }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-600 p-1 ml-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chegirma va Izoh */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Chegirma (so&apos;m)</label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="h-10 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Izoh</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ertaga soat 10:00 gacha"
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Jami hisob-kitob */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl space-y-1 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Oraliq summa:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Chegirma:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1 border-t border-emerald-200/40">
              <span>Jami To&apos;lov:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-11 text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Check className="h-4 w-4" /> Rasmiylashtirish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
