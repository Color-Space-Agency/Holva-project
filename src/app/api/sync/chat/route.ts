import { NextRequest, NextResponse } from "next/server";
import { RealtimeChatMessage, INITIAL_CHAT_MESSAGES } from "@/lib/mock-data";

// Global server in-memory store across requests
declare global {
  var __HOLVA_SERVER_CHAT_MESSAGES: RealtimeChatMessage[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_CHAT_MESSAGES) {
  globalThis.__HOLVA_SERVER_CHAT_MESSAGES = [...INITIAL_CHAT_MESSAGES];
}

function mergeArrays(a: RealtimeChatMessage[], b: RealtimeChatMessage[]): RealtimeChatMessage[] {
  const map = new Map<string, RealtimeChatMessage>();
  for (const m of a || []) {
    if (m && m.id) map.set(m.id, m);
  }
  for (const m of b || []) {
    if (m && m.id) map.set(m.id, m);
  }
  return Array.from(map.values()).sort((x, y) => (x.timestamp || 0) - (y.timestamp || 0));
}

// GET /api/sync/chat?agentId=sardor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const all = globalThis.__HOLVA_SERVER_CHAT_MESSAGES || [...INITIAL_CHAT_MESSAGES];
    const filtered = agentId ? all.filter((m) => (m.agentId || "sardor") === agentId) : all;

    return NextResponse.json({
      success: true,
      messages: filtered,
      allMessages: all,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/chat — Yangi xabar yoki xabarlar ro'yxatini sinxronlash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, sender, senderName, text, clientMessages } = body;

    let currentServer = globalThis.__HOLVA_SERVER_CHAT_MESSAGES || [...INITIAL_CHAT_MESSAGES];

    // Agar client o'zidagi xabarlar ro'yxatini yuborgan bo'lsa, server bilan birlashtirish
    if (Array.isArray(clientMessages) && clientMessages.length > 0) {
      currentServer = mergeArrays(currentServer, clientMessages);
    }

    let newMsg: RealtimeChatMessage | null = null;

    if (text && agentId && sender) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        agentId: agentId || "sardor",
        sender,
        senderName: senderName || (sender === "admin" ? "Super Admin" : "Sardor Rahimov"),
        text: String(text).trim(),
        time: timeStr,
        timestamp: Date.now(),
      };

      currentServer = mergeArrays(currentServer, [newMsg]);
    }

    globalThis.__HOLVA_SERVER_CHAT_MESSAGES = currentServer;

    const agentMessages = agentId
      ? currentServer.filter((m) => (m.agentId || "sardor") === agentId)
      : currentServer;

    return NextResponse.json({
      success: true,
      newMessage: newMsg,
      messages: agentMessages,
      allMessages: currentServer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
