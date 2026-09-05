import { getStoredStores, getStoredOrders, isRealSupabaseConfigured } from "@/lib/mock-data"
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils"

export type DocType = "Boshlang'ich qoldiq" | "Mahsulot xaridi" | "To'lov qabuli"

export interface TransactionEntry {
  id: string
  date: string
  fullDate: string
  timestamp: number
  docNumber: string
  storeName: string
  storeId: string
  docType: DocType
  description: string
  agentName: string
  debit: number
  credit: number
  balance: number
  orderId?: string
  orderItems?: any[]
}

export interface StoreFinancials {
  storeId: string
  storeName: string
  initialDebt: number
  totalDebit: number
  totalCredit: number
  currentDebt: number
  entries: TransactionEntry[]
}

/**
 * Proper accounting reconciliation ledger (Akt Sverka) engine:
 * 1. Computes all historical transactions for each store.
 * 2. Rolls all transactions prior to startDate into an accurate "Davr boshiga qoldiq qarz" (Opening Balance).
 * 3. Tracks independent per-store running balances.
 */
function buildEntries(storeId: string, startDate?: string, endDate?: string): TransactionEntry[] {
  const stores = getStoredStores()
  const allOrders = getStoredOrders()
  const result: TransactionEntry[] = []

  const matchingStores =
    storeId === "all"
      ? stores
      : stores.filter((s) => s.id === storeId || s.name === storeId)

  // Map to track running balance per store
  const storeBalanceMap = new Map<string, number>()

  for (const store of matchingStores) {
    const sId = store.id
    const sName = (store.name || "").toLowerCase().trim()
    const initialBalance = Math.abs(store.initial_balance || 0)

    // Find all orders for this store
    const storeOrders = (allOrders as any[]).filter((o: any) => {
      const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const oStoreId = o.store_id || o.stores?.id
      return (
        oStoreId === sId ||
        oStoreName === sName ||
        (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
      )
    })

    // Build complete chronological timeline of events for this store
    const allStoreEvents: Array<{
      date: string
      fullDate: string
      timestamp: number
      docNumber: string
      docType: DocType
      description: string
      agentName: string
      debit: number
      credit: number
      orderId?: string
      orderItems?: any[]
    }> = []

    for (const ord of storeOrders) {
      const ordDate = ord.created_at ? ord.created_at.split("T")[0] : "2026-01-01"
      const ts = ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? new Date(ord.created_at).getTime() : Date.now()
      const agentName = ord.agent_name || (ord.profiles?.first_name ? `${ord.profiles.first_name} ${ord.profiles.last_name || ""}`.trim() : "Sardor Rahimov")
      const fullDate = ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? formatDateTime(ord.created_at) : ordDate

      const items: any[] = ord.order_items || ord.items || []
      let desc = ""
      if (items.length > 0) {
        desc = items
          .map((it: any) => {
            const name = it.products?.name || it.product_name || "Mahsulot"
            const qty = formatNumber(it.quantity || 1)
            const price = formatCurrency(it.unit_price || it.price || 0)
            const lineTotal = formatCurrency((it.quantity || 1) * (it.unit_price || it.price || 0))
            return `${name} - ${qty} dona x ${price} = ${lineTotal}`
          })
          .join("; ")
      } else {
        desc = "Mahsulotlar xaridi"
      }

      // Debit event: Order total purchase
      if ((ord.total_amount || 0) > 0) {
        allStoreEvents.push({
          date: ordDate,
          fullDate,
          timestamp: ts,
          docNumber: ord.order_number || `ORD-${ord.id.slice(-6)}`,
          docType: "Mahsulot xaridi",
          description: desc,
          agentName,
          debit: Number(ord.total_amount) || 0,
          credit: 0,
          orderId: ord.id,
          orderItems: items,
        })
      }

      // Credit event: Payment received
      if ((ord.paid_amount || 0) > 0) {
        allStoreEvents.push({
          date: ordDate,
          fullDate,
          timestamp: ts + 1000,
          docNumber: `TOL-${(ord.order_number || ord.id).replace("HLV-", "").replace("ORD-", "")}`,
          docType: "To'lov qabuli",
          description: "Mijoz tomonidan to'lov amalga oshirildi",
          agentName,
          debit: 0,
          credit: Number(ord.paid_amount) || 0,
          orderId: ord.id,
        })
      }
    }

    // Sort this store's events by timestamp
    allStoreEvents.sort((a, b) => a.timestamp - b.timestamp)

    // Calculate opening balance before startDate
    let openingBalance = initialBalance
    const inRangeEvents: typeof allStoreEvents = []

    for (const ev of allStoreEvents) {
      if (startDate && ev.date < startDate) {
        openingBalance += (ev.debit - ev.credit)
      } else if (!endDate || ev.date <= endDate) {
        inRangeEvents.push(ev)
      }
    }

    // Set initial running balance for this store
    let currentStoreBalance = openingBalance

    // Add opening balance entry if > 0 or if single store view
    if (openingBalance > 0 || (storeId !== "all" && initialBalance > 0)) {
      result.push({
        id: `init-${store.id}`,
        date: startDate || "2026-01-01",
        fullDate: startDate ? `${startDate} (Davr boshi)` : "2026-01-01",
        timestamp: 0,
        docNumber: "BOSH-001",
        storeName: store.name,
        storeId: store.id,
        docType: "Boshlang'ich qoldiq",
        description: startDate 
          ? `Davr boshiga qoldiq qarz (${startDate} holatiga)` 
          : "Oldingi davrdan o'tgan boshlang'ich qarz",
        agentName: "Tizim",
        debit: openingBalance > 0 ? openingBalance : 0,
        credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
        balance: currentStoreBalance,
      })
    }

    // Add all events in the selected date range
    for (const ev of inRangeEvents) {
      currentStoreBalance += (ev.debit - ev.credit)
      result.push({
        id: `${ev.orderId || 'ev'}-${ev.docType === "To'lov qabuli" ? 'pay' : 'ord'}-${ev.timestamp}`,
        date: ev.date,
        fullDate: ev.fullDate,
        timestamp: ev.timestamp,
        docNumber: ev.docNumber,
        storeName: store.name,
        storeId: store.id,
        docType: ev.docType,
        description: ev.description,
        agentName: ev.agentName,
        debit: ev.debit,
        credit: ev.credit,
        balance: currentStoreBalance,
        orderId: ev.orderId,
        orderItems: ev.orderItems,
      })
    }

    storeBalanceMap.set(store.id, currentStoreBalance)
  }

  // Sort final output entries by timestamp
  result.sort((a, b) => {
    if (a.timestamp === b.timestamp) return 0
    return a.timestamp - b.timestamp
  })

  return result
}

export function buildStoreTransactions(storeId: string, startDate?: string, endDate?: string): TransactionEntry[] {
  return buildEntries(storeId, startDate, endDate)
}

export function buildAllStoresFinancials(): StoreFinancials[] {
  const stores = getStoredStores()
  const allOrders = getStoredOrders()

  return stores.map((store) => {
    const sId = store.id
    const sName = (store.name || "").toLowerCase().trim()
    const initialDebt = Math.abs(store.initial_balance || 0)

    const storeOrders = (allOrders as any[]).filter((o: any) => {
      const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const oStoreId = o.store_id || o.stores?.id
      return (
        oStoreId === sId ||
        oStoreName === sName ||
        (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
      )
    })

    const totalDebit = storeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const totalCredit = storeOrders.reduce((sum, o) => sum + (Number(o.paid_amount) || 0), 0)
    const currentDebt = initialDebt + totalDebit - totalCredit
    const entries = buildEntries(store.id)

    return {
      storeId: store.id,
      storeName: store.name,
      initialDebt,
      totalDebit,
      totalCredit,
      currentDebt,
      entries,
    }
  })
}

export function getStoreSummary(storeId: string): {
  initialDebt: number
  totalDebit: number
  totalCredit: number
  currentDebt: number
} {
  const stores = getStoredStores()
  const allOrders = getStoredOrders()
  const store = stores.find((s) => s.id === storeId || s.name === storeId)
  if (!store) return { initialDebt: 0, totalDebit: 0, totalCredit: 0, currentDebt: 0 }

  const sId = store.id
  const sName = (store.name || "").toLowerCase().trim()
  const initialDebt = Math.abs(store.initial_balance || 0)

  const storeOrders = (allOrders as any[]).filter((o: any) => {
    const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
    const oStoreId = o.store_id || o.stores?.id
    return (
      oStoreId === sId ||
      oStoreName === sName ||
      (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
    )
  })

  const totalDebit = storeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const totalCredit = storeOrders.reduce((sum, o) => sum + (Number(o.paid_amount) || 0), 0)
  const currentDebt = initialDebt + totalDebit - totalCredit

  return {
    initialDebt,
    totalDebit,
    totalCredit,
    currentDebt,
  }
}
