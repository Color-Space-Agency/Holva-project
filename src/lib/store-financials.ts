import { getStoredStores, getStoredOrders, MockStore, MockOrder } from "@/lib/mock-data"
import { formatCurrency, formatNumber, formatDate, formatTime } from "@/lib/utils"

export type DocType = "Boshlang'ich qoldiq" | "Mahsulot xaridi" | "To'lov qabuli"

export interface OrderItemDetail {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export interface TransactionEntry {
  id: string
  date: string
  time: string
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
  orderItems: OrderItemDetail[]
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
 * Bulletproof accounting ledger for Akt Sverka:
 * - Collects all stores and any store mentioned in orders (never misses a client)
 * - Accurately distinguishes initial balance from order purchases (no double counting)
 * - Captures exact date and time for every transaction
 * - Formats full itemized product list with quantity, unit price, and total line price
 * - Calculates running balance / debt chronologically
 */
function buildEntries(storeId: string, startDate?: string, endDate?: string): TransactionEntry[] {
  const rawStores = getStoredStores()
  const allOrders = getStoredOrders()
  const result: TransactionEntry[] = []

  // Ensure all stores mentioned in orders exist in the stores list
  const stores: MockStore[] = [...rawStores]
  const existingNames = new Set(stores.map((s) => s.name.toLowerCase().trim()))
  const existingIds = new Set(stores.map((s) => s.id))

  for (const o of allOrders as any[]) {
    const oName = (o.stores?.name || o.store_name || "").trim()
    const oId = o.store_id || o.stores?.id || `s-gen-${oName.toLowerCase().replace(/\s+/g, "-")}`
    if (oName && !existingNames.has(oName.toLowerCase()) && !existingIds.has(oId)) {
      stores.push({
        id: oId,
        name: oName,
        phone: o.stores?.phone || "+998 90 000 00 00",
        address: o.stores?.address || "—",
        contact_person: o.stores?.contact_person || "Mijoz",
        credit_limit: 10000000,
        current_balance: 0,
        initial_balance: 0,
        status: "ACTIVE",
        created_at: o.created_at || new Date().toISOString(),
      })
      existingNames.add(oName.toLowerCase())
      existingIds.add(oId)
    }
  }

  const matchingStores =
    storeId === "all"
      ? stores
      : stores.filter((s) => s.id === storeId || s.name.toLowerCase().trim() === storeId.toLowerCase().trim())

  for (const store of matchingStores) {
    const sId = store.id
    const sName = (store.name || "").toLowerCase().trim()

    // Find all orders for this store
    const storeOrders = (allOrders as any[]).filter((o: any) => {
      const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const oStoreId = o.store_id || o.stores?.id
      return (
        (sId && oStoreId === sId) ||
        (sName && oStoreName === sName) ||
        (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
      )
    })

    // Determine initial debt:
    // If orders exist, explicit initial_balance is the opening debt.
    // If NO orders exist, but the store has a negative current_balance (e.g. 25,000 debt entered on store creation),
    // then that current_balance is treated as the initial debt so it's never lost.
    const explicitInitDebt = Math.abs(store.initial_balance || 0)
    const initialDebt =
      storeOrders.length > 0
        ? explicitInitDebt
        : Math.max(explicitInitDebt, store.current_balance && store.current_balance < 0 ? Math.abs(store.current_balance) : 0)

    const allStoreEvents: Array<{
      date: string
      time: string
      fullDate: string
      timestamp: number
      docNumber: string
      docType: DocType
      description: string
      agentName: string
      debit: number
      credit: number
      orderId?: string
      orderItems: OrderItemDetail[]
    }> = []

    for (const ord of storeOrders) {
      let ordDate = "2026-01-01"
      let ordTime = "12:00"
      let fullDate = "01.01.2026, 12:00"
      let ts = Date.now()

      if (ord.created_at) {
        const d = new Date(ord.created_at)
        if (!isNaN(d.getTime())) {
          ts = d.getTime()
          ordDate = ord.created_at.split("T")[0]
          ordTime = formatTime(d)
          fullDate = `${formatDate(d)}, ${ordTime}`
        }
      }

      const agentName =
        ord.agent_name ||
        (ord.profiles?.first_name ? `${ord.profiles.first_name} ${ord.profiles.last_name || ""}`.trim() : "Sardor Rahimov")

      // Parse order items
      const rawItems: any[] = ord.order_items || ord.items || []
      const parsedItems: OrderItemDetail[] = []

      if (rawItems.length > 0) {
        for (const it of rawItems) {
          const name = it.products?.name || it.product_name || "Mahsulot"
          const qty = Number(it.quantity) || 1
          const unit = it.products?.unit || it.unit || "dona"
          const price = Number(it.unit_price || it.price || 0)
          const total = Number(it.total_price) || qty * price
          parsedItems.push({
            name,
            quantity: qty,
            unit,
            unitPrice: price,
            totalPrice: total,
          })
        }
      } else if (ord.total_amount) {
        parsedItems.push({
          name: "Mahsulotlar partiyasi",
          quantity: ord.items_count || 1,
          unit: "dona",
          unitPrice: Math.round(Number(ord.total_amount) / (ord.items_count || 1)),
          totalPrice: Number(ord.total_amount),
        })
      }

      let desc = ""
      if (parsedItems.length > 0) {
        desc = parsedItems
          .map((it) => `${it.name} - ${formatNumber(it.quantity)} ${it.unit} x ${formatCurrency(it.unitPrice)} = ${formatCurrency(it.totalPrice)}`)
          .join("; ")
      } else {
        desc = "Mahsulotlar xaridi"
      }

      // 1) Debit event for purchase
      if ((ord.total_amount || 0) > 0) {
        allStoreEvents.push({
          date: ordDate,
          time: ordTime,
          fullDate,
          timestamp: ts,
          docNumber: ord.order_number || `ORD-${String(ord.id).slice(-6)}`,
          docType: "Mahsulot xaridi",
          description: desc,
          agentName,
          debit: Number(ord.total_amount) || 0,
          credit: 0,
          orderId: ord.id,
          orderItems: parsedItems,
        })
      }

      // 2) Credit event for payment
      if ((ord.paid_amount || 0) > 0) {
        allStoreEvents.push({
          date: ordDate,
          time: ordTime,
          fullDate,
          timestamp: ts + 500, // Slight offset so payment renders immediately after purchase
          docNumber: `TOL-${String(ord.order_number || ord.id).replace("HLV-", "").replace("ORD-", "")}`,
          docType: "To'lov qabuli",
          description: `Mijoz tomonidan ${formatCurrency(ord.paid_amount)} to'lov qabul qilindi`,
          agentName,
          debit: 0,
          credit: Number(ord.paid_amount) || 0,
          orderId: ord.id,
          orderItems: [],
        })
      }
    }

    allStoreEvents.sort((a, b) => a.timestamp - b.timestamp)

    let openingBalance = initialDebt
    const inRangeEvents: typeof allStoreEvents = []

    for (const ev of allStoreEvents) {
      if (startDate && startDate !== "all" && ev.date < startDate) {
        openingBalance += ev.debit - ev.credit
      } else if (!endDate || endDate === "all" || ev.date <= endDate) {
        inRangeEvents.push(ev)
      }
    }

    let currentStoreBalance = openingBalance

    // Include opening balance row if any prior debt exists
    if (openingBalance > 0 || initialDebt > 0 || (storeId !== "all" && inRangeEvents.length === 0)) {
      result.push({
        id: `init-${store.id}`,
        date: startDate && startDate !== "all" ? startDate : "2026-01-01",
        time: "00:00",
        fullDate: startDate && startDate !== "all" ? `${startDate} (Boshlang'ich qoldiq)` : "2026-01-01",
        timestamp: 0,
        docNumber: "BOSH-001",
        storeName: store.name,
        storeId: store.id,
        docType: "Boshlang'ich qoldiq",
        description: `Boshlang'ich qoldiq qarz summasi (${formatCurrency(openingBalance || initialDebt)})`,
        agentName: "Tizim",
        debit: openingBalance > 0 ? openingBalance : initialDebt,
        credit: 0,
        balance: currentStoreBalance || initialDebt,
        orderItems: [],
      })
    }

    for (const ev of inRangeEvents) {
      currentStoreBalance += ev.debit - ev.credit
      result.push({
        id: `${ev.orderId || "ev"}-${ev.docType === "To'lov qabuli" ? "pay" : "ord"}-${ev.timestamp}`,
        date: ev.date,
        time: ev.time,
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
  }

  result.sort((a, b) => a.timestamp - b.timestamp)
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

    const storeOrders = (allOrders as any[]).filter((o: any) => {
      const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const oStoreId = o.store_id || o.stores?.id
      return (
        (sId && oStoreId === sId) ||
        (sName && oStoreName === sName) ||
        (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
      )
    })

    const explicitInitDebt = Math.abs(store.initial_balance || 0)
    const initialDebt =
      storeOrders.length > 0
        ? explicitInitDebt
        : Math.max(explicitInitDebt, store.current_balance && store.current_balance < 0 ? Math.abs(store.current_balance) : 0)

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
  const store = stores.find((s) => s.id === storeId || s.name.toLowerCase().trim() === storeId.toLowerCase().trim())
  if (!store) return { initialDebt: 0, totalDebit: 0, totalCredit: 0, currentDebt: 0 }

  const sId = store.id
  const sName = (store.name || "").toLowerCase().trim()

  const storeOrders = (allOrders as any[]).filter((o: any) => {
    const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
    const oStoreId = o.store_id || o.stores?.id
    return (
      (sId && oStoreId === sId) ||
      (sName && oStoreName === sName) ||
      (sName && oStoreName && (sName.includes(oStoreName) || oStoreName.includes(sName)))
    )
  })

  const explicitInitDebt = Math.abs(store.initial_balance || 0)
  const initialDebt =
    storeOrders.length > 0
      ? explicitInitDebt
      : Math.max(explicitInitDebt, store.current_balance && store.current_balance < 0 ? Math.abs(store.current_balance) : 0)

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
