import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRealSupabaseConfigured, INITIAL_ORDERS } from "@/lib/mock-data";

// GET /api/orders — Sotuvlarni filtrlash va paginatsiya bilan olish
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");
    const storeId = searchParams.get("store_id") || searchParams.get("client_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    if (isRealSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        let query = supabase
          .from("orders")
          .select(
            `
            *,
            stores:store_id(name),
            profiles:agent_id(first_name, last_name)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false });

        if (status) {
          query = query.eq("status", status);
        }
        if (storeId) {
          query = query.eq("store_id", storeId);
        }
        if (dateFrom) {
          query = query.gte("created_at", dateFrom);
        }
        if (dateTo) {
          query = query.lte("created_at", dateTo);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (!error && data) {
          const total = count || data.length;
          return NextResponse.json({
            data,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          });
        }
      } catch (err) {
        console.error("Supabase API error:", err);
      }
    }

    // Fallback Mock Data
    let filtered = INITIAL_ORDERS.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      store_id: (o as any).store_id || "s-1",
      store_name: o.store_name,
      agent_name: o.agent_name,
      total_amount: o.total_amount,
      paid_amount: o.paid_amount,
      remaining_amount: o.total_amount - (o.paid_amount || 0),
      status: o.status,
      payment_status: o.payment_status,
      created_at: o.created_at,
    }));

    if (status && status !== "ALL") {
      filtered = filtered.filter((o) => o.status === status);
    }
    if (storeId) {
      filtered = filtered.filter((o) => o.store_id === storeId);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Sotuvlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

// POST /api/orders — Yangi Sotuv yaratish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_id,
      client_id,
      agent_id,
      order_date,
      delivery_date,
      items, // [{ product_id, quantity, price, discount_amount }]
      prepayment = 0,
      paid_amount = 0,
      delivery_address,
      notes = "",
    } = body;

    const actualStoreId = store_id || client_id;

    if (!actualStoreId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Do'kon va mahsulotlar ro'yxati talab qilinadi" },
        { status: 400 }
      );
    }

    // Auto-generate order number (H-YYYYMMDD-001)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `H-${dateStr}-${randomNum}`;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const price = Number(item.price || item.unit_price) || 0;
      const quantity = Number(item.quantity) || 1;
      const discount = Number(item.discount_amount) || 0;
      const total = quantity * price - discount;
      totalAmount += total;
      return {
        product_id: item.product_id,
        quantity,
        unit_price: price,
        discount_amount: discount,
        total_price: total,
      };
    });

    const prepay = Number(prepayment || paid_amount) || 0;
    const remaining = Math.max(0, totalAmount - prepay);
    const paymentStatus =
      prepay >= totalAmount ? "PAID" : prepay > 0 ? "PARTIAL" : "PENDING";

    if (isRealSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            store_id: actualStoreId,
            agent_id: agent_id || user?.id,
            total_amount: totalAmount,
            notes,
            status: "CONFIRMED",
            payment_status: paymentStatus,
            created_by: user?.id,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        if (order && orderItems.length > 0) {
          const itemsPayload = orderItems.map((it: any) => ({
            ...it,
            order_id: order.id,
          }));
          await supabase.from("order_items").insert(itemsPayload);
        }

        return NextResponse.json(order, { status: 201 });
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    }

    // Mock response
    const mockCreatedOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      store_id: actualStoreId,
      agent_id: agent_id || "agent-1",
      total_amount: totalAmount,
      prepayment_amount: prepay,
      remaining_amount: remaining,
      delivery_address: delivery_address || "",
      notes,
      status: "CONFIRMED",
      payment_status: paymentStatus,
      created_at: new Date().toISOString(),
      order_items: orderItems,
    };

    return NextResponse.json(mockCreatedOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Sotuv yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
