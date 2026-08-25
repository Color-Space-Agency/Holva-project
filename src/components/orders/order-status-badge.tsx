"use client"

import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Flame,
  FileText,
  XCircle,
  AlertCircle,
  Coins,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react"

interface StatusProps {
  status: string
}

export function OrderStatusBadge({ status }: StatusProps) {
  switch (status) {
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Yetkazib berildi</span>
        </span>
      )
    case "DELIVERING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
          <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
          <span>Yetkazilmoqda</span>
        </span>
      )
    case "READY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
          <PackageCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span>Tayyor (Omborda)</span>
        </span>
      )
    case "PREPARING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
          <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>Tayyorlanmoqda</span>
        </span>
      )
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
          <ClipboardCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
          <span>Qabul qilindi</span>
        </span>
      )
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          <FileText className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          <span>Qoralama</span>
        </span>
      )
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40">
          <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
          <span>Bekor qilingan</span>
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Clock className="h-3.5 w-3.5" />
          <span>{status}</span>
        </span>
      )
  }
}

export function OrderPaymentStatusBadge({ status }: StatusProps) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>To&apos;langan</span>
        </span>
      )
    case "PARTIAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
          <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>Qisman to&apos;langan</span>
        </span>
      )
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>To&apos;lanmagan</span>
        </span>
      )
    case "OVERDUE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
          <span>Muddati o&apos;tgan</span>
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Clock className="h-3.5 w-3.5" />
          <span>{status}</span>
        </span>
      )
  }
}
