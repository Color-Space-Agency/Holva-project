"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Send, DollarSign, CheckCircle2, ShieldCheck } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface OrderReceipt1CDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    order_number: string
    created_at: string
    total_amount: number
    paid_amount?: number
    stores?: {
      name: string
      phone?: string
      address?: string
    }
    profiles?: {
      first_name: string
      last_name: string
    }
  }
}

export function OrderReceipt1CDialog({
  open,
  onOpenChange,
  order,
}: OrderReceipt1CDialogProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleShareTelegram = () => {
    const text = `💰 *KASSA KVITANSIYASI (PKO) № ${order.order_number}*\n` +
      `🏢 Do'kon: ${order.stores?.name || 'Mijoz'}\n` +
      `📅 Sana: ${formatDate(order.created_at)}\n` +
      `💵 Qabul qilingan summa: ${formatCurrency(order.paid_amount || order.total_amount)}\n` +
      `✅ To'lov tasdiqlandi. "HOLVA FACTORY" MCHJ`;

    const url = `https://t.me/share/url?url=${encodeURIComponent("https://holva-crm.vercel.app")}&text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    toast.success("Kvitansiya Telegram orqali yuborilmoqda")
  }

  const receiptNumber = `PKO-${order.order_number.replace(/[^0-9]/g, "") || "00104"}`
  const paySum = order.paid_amount && order.paid_amount > 0 ? order.paid_amount : order.total_amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] sm:max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:max-w-full print:border-none print:shadow-none">
        <DialogHeader className="print:hidden border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              1C Kirim Kassa Orderi (Kvitansiya)
            </DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              № {receiptNumber} &bull; Rasmiy to&apos;lov kvitansiyasi
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </Button>
          </div>
        </DialogHeader>

        {/* 1C PKO Format */}
        <div className="overflow-x-auto print:overflow-visible">
          <div className="min-w-[600px] space-y-4 text-gray-900 dark:text-gray-100 print:text-black font-sans text-xs sm:text-sm border p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 print:border-none">
            <div className="flex justify-between items-start border-b pb-3">
            <div>
              <div className="font-bold text-base">&ldquo;HOLVA FACTORY&rdquo; MCHJ</div>
              <div className="text-xs text-gray-500">INN: 308945120 &bull; Kassa bo&apos;limi</div>
            </div>
            <div className="text-right text-[11px] text-gray-400">
              <div>Shakl KO-1 (1C standart)</div>
              <div>№ {receiptNumber}</div>
            </div>
          </div>

          <div className="text-center py-1">
            <h3 className="text-lg font-black uppercase">KIRIM KASSA ORDERI KVITANSIYASI</h3>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sana: {formatDate(order.created_at)}</p>
          </div>

          <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500">Kimdan qabul qilindi:</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.stores?.name || "Savdo do'koni"}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500">Asos (Hujjat):</span>
              <span className="font-medium text-gray-900 dark:text-white">№ {order.order_number} sonli sotuv yuk xati uchun to&apos;lov</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500">Qabul qiluvchi xodim:</span>
              <span className="font-medium text-gray-900 dark:text-white">{order.profiles?.first_name} {order.profiles?.last_name || "Kassir"}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Qabul qilingan summa:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(paySum)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
            <div className="space-y-4">
              <div>
                <span className="font-bold block">Bosh hisobchi:</span>
              </div>
              <div className="border-b border-black dark:border-white pb-1">
                <span className="text-gray-400">Imzo: _______________</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="font-bold block">Pulni qabul qildi (Kassir):</span>
              </div>
              <div className="border-b border-black dark:border-white pb-1">
                <span className="text-gray-400">Imzo: _______________</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 text-[11px] text-gray-400">
            M.O&apos;. (Kassa muhri o&apos;rni) &bull; To&apos;lov to&apos;liq qabul qilindi
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
