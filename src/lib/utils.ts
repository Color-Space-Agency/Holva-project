import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "UZS"): string {
  const safeAmount = Number(amount) || 0
  if (currency === "UZS") {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount) + " so'm"
  }
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
  }).format(safeAmount)
}

export function formatNumber(num: number, decimals = 0): string {
  const safeNum = Number(num) || 0
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeNum)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      // Agar "25.08.2026" kabi string bo'lsa
      return String(date)
    }
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d)
  } catch {
    return String(date)
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return String(date)
    }
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return String(date)
  }
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return String(date)
    }
    return new Intl.DateTimeFormat("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return String(date)
  }
}

export function generateOrderNumber(): string {
  const prefix = "ORD"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0")
  return `${prefix}-${timestamp}-${random}`
}

export function generateBatchNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `BATCH-${year}${month}${day}-${random}`
}

export function generateDeliveryNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `DEL-${year}${month}-${random}`
}

export function calculateCostPerUnit(
  totalCost: number,
  yieldQuantity: number
): number {
  if (yieldQuantity <= 0) return 0
  return totalCost / yieldQuantity
}

export function calculateProfit(
  revenue: number,
  cost: number
): { profit: number; margin: number } {
  const profit = revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return { profit, margin }
}
