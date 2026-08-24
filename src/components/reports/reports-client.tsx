'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, Table } from 'lucide-react';
import { generateSalesReport } from '@/lib/export/pdf-export';
import { exportToExcel } from '@/lib/export/excel-export';
import { exportToCSV } from '@/lib/export/csv-export';

export function ReportsClient() {
  const [reportType, setReportType] = useState('sales');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      // Mock data fetching based on dates
      await generateSalesReport({
        title: 'Sotuvlar hisoboti',
        period: `${fromDate} - ${toDate}`,
        data: [
          { id: '1', date: '2023-10-01', store: 'Do\'kon A', total: 1500000 },
          { id: '2', date: '2023-10-02', store: 'Do\'kon B', total: 2300000 },
        ]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    exportToExcel(
      [{ id: 1, name: 'Sotuv', sum: 15000 }], 
      'Hisobot', 
      [{ header: 'ID', key: 'id' }, { header: 'Nomi', key: 'name' }, { header: 'Summa', key: 'sum' }]
    );
  };

  const handleExportCSV = async () => {
    exportToCSV([{ id: 1, nomi: 'Test', summa: 1000 }], 'hisobot');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hisobotlar</h1>
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
                  <SelectItem value="sales">Sotuvlar</SelectItem>
                  <SelectItem value="products">Mahsulotlar</SelectItem>
                  <SelectItem value="stores">Do'konlar</SelectItem>
                  <SelectItem value="agents">Agentlar</SelectItem>
                  <SelectItem value="production">Ishlab chiqarish</SelectItem>
                  <SelectItem value="finance">Moliya</SelectItem>
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

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={handleExportPDF} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              <FileText className="h-4 w-4 mr-2" /> PDF Yuklash
            </Button>
            <Button onClick={handleExportExcel} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <Table className="h-4 w-4 mr-2" /> Excel Yuklash
            </Button>
            <Button onClick={handleExportCSV} disabled={isLoading} variant="outline">
              <Download className="h-4 w-4 mr-2" /> CSV Yuklash
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          Tanlangan parametrlar bo'yicha hisobot yaratish uchun yuqoridagi tugmalardan birini bosing.
        </CardContent>
      </Card>
    </div>
  );
}
