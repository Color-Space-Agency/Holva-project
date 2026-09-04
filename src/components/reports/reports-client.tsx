"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, Table, FileCheck2, Printer } from 'lucide-react';
import { generateSalesReport } from '@/lib/export/pdf-export';
import { exportToExcel } from '@/lib/export/excel-export';
import { exportToCSV } from '@/lib/export/csv-export';
import { StoreActReconciliationDialog } from '@/components/stores/store-act-reconciliation-dialog';
import { getStoredStores, getStoredOrders, MockStore } from '@/lib/mock-data';
import { toast } from 'sonner';

export function ReportsClient() {
  const [reportType, setReportType] = useState('sales');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<MockStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);
  const [isActOpen, setIsActOpen] = useState(false);

  useEffect(() => {
    const list = getStoredStores();
    setStores(list);
    if (list.length > 0) setSelectedStore(list[0]);
  }, []);

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const orders = getStoredOrders() as any[];
      const reportData = orders.map((o, idx) => ({
        id: String(idx + 1),
        date: o.created_at ? o.created_at.split("T")[0] : "2026-08-29",
        store: o.stores?.name || o.store_name || "Do'kon",
        total: o.total_amount || 0,
      }));

      await generateSalesReport({
        title: 'Sotuvlar hisoboti',
        period: `${fromDate} - ${toDate}`,
        data: reportData.length > 0 ? reportData : [
          { id: '1', date: '2026-08-10', store: 'Korzinka — Chilonzor', total: 14800000 },
        ],
      });
      toast.success("PDF hisoboti shakllantirildi va yuklandi!");
    } catch (error) {
      console.error(error);
      toast.error("PDF yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const orders = getStoredOrders() as any[];
      const excelRows = orders.map((o, idx) => ({
        id: idx + 1,
        doc: o.order_number || `HLV-${o.id}`,
        store: o.stores?.name || o.store_name || "Do'kon",
        total: o.total_amount || 0,
        paid: o.paid_amount || 0,
        debt: Math.max(0, (o.total_amount || 0) - (o.paid_amount || 0)),
      }));

      exportToExcel(
        excelRows.length > 0 ? excelRows : [
          { id: 1, doc: 'HLV-00104', store: 'Korzinka — Chilonzor', total: 14800000, paid: 10000000, debt: 4800000 },
        ],
        'Sotuvlar_va_Qarzlar_Hisoboti', 
        [
          { header: '№', key: 'id' }, 
          { header: 'Hujjat', key: 'doc' },
          { header: "Do'kon", key: 'store' }, 
          { header: 'Jami Summa', key: 'total' },
          { header: "To'langan", key: 'paid' },
          { header: 'Qoldiq Qarz', key: 'debt' },
        ]
      );
      toast.success("Excel hisoboti yuklandi!");
    } catch {
      toast.error("Excel yuklashda xatolik");
    }
  };

  const handleExportCSV = async () => {
    try {
      const orders = getStoredOrders() as any[];
      const csvRows = orders.map((o, idx) => ({
        id: idx + 1,
        hujjat: o.order_number || `HLV-${o.id}`,
        dokon: o.stores?.name || o.store_name || "Do'kon",
        summa: o.total_amount || 0,
        tolandi: o.paid_amount || 0,
      }));

      exportToCSV(
        csvRows.length > 0 ? csvRows : [
          { id: 1, hujjat: 'HLV-00104', dokon: 'Korzinka — Chilonzor', summa: 14800000, tolandi: 10000000 }
        ], 
        'sotuv_va_hisob_kitob'
      );
      toast.success("CSV hisoboti yuklandi!");
    } catch {
      toast.error("CSV yuklashda xatolik");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hisobotlar va Tahlillar</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Barcha bo&apos;limlar, sotuvlar, qarzlar va o&apos;zaro solishtirma dalolatnomalari
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hisobot parametrlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Hisobot turi</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sotuvlar hisoboti</SelectItem>
                  <SelectItem value="akt_sverka">Do&apos;konlar bo&apos;yicha Akt Sverka</SelectItem>
                  <SelectItem value="products">Mahsulotlar hisoboti</SelectItem>
                  <SelectItem value="stores">Do&apos;konlar va Qarzlar</SelectItem>
                  <SelectItem value="agents">Agentlar samaradorligi</SelectItem>
                  <SelectItem value="production">Ishlab chiqarish</SelectItem>
                  <SelectItem value="finance">Moliya va Kassa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Boshlanish sanasi</label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tugash sanasi</label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>

          {reportType === 'akt_sverka' && selectedStore && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
              <label className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Solishtirma dalolatnomasi uchun do&apos;konni tanlang:
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Select
                  value={selectedStore.id}
                  onValueChange={(val) => {
                    const found = stores.find(s => s.id === val);
                    if (found) setSelectedStore(found);
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Do'konni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} (Balans: {s.current_balance < 0 ? `-${Math.abs(s.current_balance).toLocaleString()} so'm qarz` : '0 so\'m'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setIsActOpen(true)}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Akt Sverkai Ochish va Chop etish
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={handleExportPDF} disabled={isLoading} className="bg-red-600 hover:bg-red-700 cursor-pointer">
              <FileText className="h-4 w-4 mr-2" /> PDF Yuklash
            </Button>
            <Button onClick={handleExportExcel} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
              <Table className="h-4 w-4 mr-2" /> Excel Yuklash
            </Button>
            <Button onClick={handleExportCSV} disabled={isLoading} variant="outline" className="cursor-pointer">
              <Download className="h-4 w-4 mr-2" /> CSV Yuklash
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground space-y-2">
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            Tanlangan hisobot turi: <span className="text-amber-600">{reportType.toUpperCase()}</span>
          </p>
          <p className="text-xs text-gray-500">
            Hisobotni shakllantirish va fayl ko&apos;rinishida yuklab olish uchun yuqoridagi amallardan foydalaning.
          </p>
        </CardContent>
      </Card>

      {selectedStore && (
        <StoreActReconciliationDialog
          open={isActOpen}
          onOpenChange={setIsActOpen}
          store={selectedStore}
        />
      )}
    </div>
  );
}
