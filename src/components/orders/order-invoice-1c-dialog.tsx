"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Send, CheckCircle2, FileText, Building2, ShieldCheck, Share2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface OrderInvoice1CDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    order_number: string
    created_at: string
    total_amount: number
    paid_amount?: number
    status?: string
    payment_status?: string
    stores?: {
      name: string
      phone?: string
      address?: string
    }
    profiles?: {
      first_name: string
      last_name: string
    }
    order_items?: Array<{
      id: string
      quantity: number
      unit_price: number
      total_price: number
      products?: {
        name: string
      }
    }>
  }
}

export function OrderInvoice1CDialog({
  open,
  onOpenChange,
  order,
}: OrderInvoice1CDialogProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleShareTelegram = () => {
    const text = `🧾 *HOLVA FACTORY — YUK XATI № ${order.order_number}*\n` +
      `🏢 Do'kon: ${order.stores?.name || 'Mijoz'}\n` +
      `📅 Sana: ${formatDate(order.created_at)}\n` +
      `💰 Jami summa: ${formatCurrency(order.total_amount)}\n` +
      `💳 To'langan: ${formatCurrency(order.paid_amount || 0)}\n` +
      `📌 Holat: ${order.status || 'YETKAZILMOQDA'}\n\n` +
      `Tovarlar soni: ${order.order_items?.length || 0} xil\n` +
      `Bizni tanlaganingiz uchun tashakkur!`;

    const url = `https://t.me/share/url?url=${encodeURIComponent("https://holva-crm.vercel.app")}&text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    toast.success("Telegram orqali yuborish oynasi ochildi")
  }

  const items = order.order_items && order.order_items.length > 0 ? order.order_items : [
    { id: "1", quantity: 15, unit_price: 38000, total_price: 570000, products: { name: "Klassik Samarqand Holvasi (500g)" } },
    { id: "2", quantity: 20, unit_price: 45000, total_price: 900000, products: { name: "Kunjutli Premium Holva (500g)" } },
    { id: "3", quantity: 10, unit_price: 52000, total_price: 520000, products: { name: "Shokoladli Marmar Holva (500g)" } },
  ]

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] xl:max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:max-w-full print:border-none print:shadow-none">
        <DialogHeader className="print:hidden border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-600" />
              1C Standartidagi Yuk Xati (ТОРГ-12 / Nakladnaya)
            </DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              № {order.order_number} &bull; Rasmiy tovar-transport hujjati
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTelegram}
              className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 hover:bg-sky-100 cursor-pointer gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Telegramga yuborish</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print / PDF)</span>
            </Button>
          </div>
        </DialogHeader>

        {/* ============================================================ */}
        {/* 1C RASMIY YUK XATI FORMALARI (A4 PRINT UCHUN TOZA DIZAYN) */}
        {/* ============================================================ */}
        <div className="overflow-x-auto print:overflow-visible">
          <div className="min-w-[800px] mt-6 print:mt-0 font-sans text-sm bg-white text-black p-4 sm:p-8 rounded-sm shadow-sm print:shadow-none">
          
          {/* Yuqori 1C form kodi */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4 text-[11px] text-gray-500">
            <div>
              <span>Shakl: <strong>1C ТОРГ-12 / ЭСФ</strong></span>
            </div>
            <div className="text-right">
              <div>O&apos;zbekiston Respublikasi standartiga muvofiq</div>
              <div>Hujjat turi: <strong>TOVAR YUK XATI</strong></div>
            </div>
          </div>

          {/* Sarlavha */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900 dark:text-white print:text-black">
              YUK XATI № {order.order_number}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              Sana: {formatDate(order.created_at)}
            </p>
          </div>

          {/* Rekvizitlar Jadvali (1C Standart) */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 dark:divide-gray-700">
              {/* Yetkazib beruvchi */}
              <div className="p-3 space-y-1 bg-gray-50/50 dark:bg-gray-800/40">
                <span className="font-bold text-amber-900 dark:text-amber-400 block uppercase text-[10px] tracking-wider">
                  YETKAZIB BERUVCHI (YUK YUBORUVCHI):
                </span>
                <div className="font-bold text-sm text-gray-900 dark:text-white">&ldquo;HOLVA FACTORY&rdquo; MCHJ</div>
                <div>INN: 308945120 | MFO: 00440</div>
                <div>Hisob-raqam: 20208000900000123456 (ATIB &ldquo;Ipoteka-bank&rdquo;)</div>
                <div>Manzil: Toshkent sh., Chilonzor tumani, Sanoat hududi 12</div>
                <div>Tel: +998 (71) 200-00-55</div>
              </div>

              {/* Qabul qiluvchi */}
              <div className="p-3 space-y-1 bg-gray-50/50 dark:bg-gray-800/40">
                <span className="font-bold text-amber-900 dark:text-amber-400 block uppercase text-[10px] tracking-wider">
                  XARIDOR (YUK QABUL QILUVCHI):
                </span>
                <div className="font-bold text-sm text-gray-900 dark:text-white">{order.stores?.name || "Savdo do'koni"}</div>
                <div>Manzil: {order.stores?.address || "Toshkent shahri"}</div>
                <div>Aloqa: {order.stores?.phone || "+998 90 000 00 00"}</div>
                <div>Mas&apos;ul sotuv agenti: {order.profiles?.first_name} {order.profiles?.last_name}</div>
                <div>To&apos;lov sharti: Shartnoma asosida</div>
              </div>
            </div>
          </div>

          {/* Tovarlar jadvali (1C Standart) */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="p-2 w-8 text-center border-r border-gray-300 dark:border-gray-700">№</th>
                  <th className="p-2 border-r border-gray-300 dark:border-gray-700">Mahsulot nomi va tavsifi</th>
                  <th className="p-2 w-16 text-center border-r border-gray-300 dark:border-gray-700">O&apos;lchov</th>
                  <th className="p-2 w-16 text-right border-r border-gray-300 dark:border-gray-700">Miqdor</th>
                  <th className="p-2 w-28 text-right border-r border-gray-300 dark:border-gray-700">Narx (so&apos;m)</th>
                  <th className="p-2 w-16 text-center border-r border-gray-300 dark:border-gray-700">QQS</th>
                  <th className="p-2 w-32 text-right">Summa (so&apos;m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 dark:hover:bg-gray-800/40">
                    <td className="p-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">{idx + 1}</td>
                    <td className="p-2 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                      {item.products?.name || `Holva mahsuloti #${idx + 1}`}
                    </td>
                    <td className="p-2 text-center text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">dona</td>
                    <td className="p-2 text-right font-semibold border-r border-gray-200 dark:border-gray-700">{item.quantity}</td>
                    <td className="p-2 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="p-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">0%</td>
                    <td className="p-2 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.total_price || item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}

                {/* Jami qatori */}
                <tr className="bg-amber-50 dark:bg-amber-950/40 font-bold border-t-2 border-gray-300 dark:border-gray-700">
                  <td colSpan={3} className="p-2 text-right uppercase tracking-wider text-xs">
                    JAMI TOPSHIRILDI:
                  </td>
                  <td className="p-2 text-right text-amber-900 dark:text-amber-300">
                    {totalQuantity} ta
                  </td>
                  <td colSpan={2} className="p-2 text-right">Jami summa:</td>
                  <td className="p-2 text-right text-sm text-amber-900 dark:text-amber-300">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summa so'z bilan (1C Standart) */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <span className="font-semibold text-gray-500 block">Jami to&apos;lov summasi so&apos;z bilan:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.total_amount)} (QQS siz, to&apos;lov muddati shartnoma bo&apos;yicha)
            </span>
          </div>

          {/* 1C Imzo va Muhr qismlari */}
          <div className="grid grid-cols-2 gap-8 pt-6 pb-2 text-xs">
            <div className="space-y-6">
              <div>
                <span className="font-bold block">&ldquo;HOLVA FACTORY&rdquo; MCHJ (Topshiruvchi):</span>
                <span className="text-gray-500 text-[11px]">Bosh direktor / Ombor mudiri</span>
              </div>
              <div className="flex items-end justify-between border-b border-black dark:border-white pb-1">
                <span className="text-gray-400 text-[11px]">Imzo: _______________</span>
                <span className="font-semibold text-[11px]">F.I.SH. ____________</span>
              </div>
              <div className="text-[10px] text-gray-400">M.O&apos;. (Muhr o&apos;rni)</div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-bold block">&ldquo;{order.stores?.name || 'Mijoz'}&rdquo; (Qabul qiluvchi):</span>
                <span className="text-gray-500 text-[11px]">Do&apos;kon mudiri / Moddiy javobgar shaxs</span>
              </div>
              <div className="flex items-end justify-between border-b border-black dark:border-white pb-1">
                <span className="text-gray-400 text-[11px]">Imzo: _______________</span>
                <span className="font-semibold text-[11px]">F.I.SH. ____________</span>
              </div>
              <div className="text-[10px] text-gray-400">M.O&apos;. (Muhr o&apos;rni)</div>
            </div>
          </div>

        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
