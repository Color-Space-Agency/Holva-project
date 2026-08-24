import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "UZS"): string {
  if (currency === "UZS") {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " so'm"
  }
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function generateOrderNumber(): string {
  const prefix = "ORD"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0")
  return `${prefix}-${timestamp}${random}`
}

export function generateBatchNumber(): string {
  const prefix = "BAT"
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${prefix}-${date}-${random}`
}

export function generateDeliveryNumber(): string {
  const prefix = "DEL"
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}-${timestamp}`
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function safeUUID(value: string | null | undefined): string | null {
  if (!value || !isValidUUID(value)) return null
  return value
}
