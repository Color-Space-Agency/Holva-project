import { NextRequest, NextResponse } from "next/server";
import { RealtimeChatMessage, INITIAL_CHAT_MESSAGES } from "@/lib/mock-data";

// Global server in-memory store across requests
declare global {
  var __HOLVA_SERVER_CHAT_MESSAGES: RealtimeChatMessage[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_CHAT_MESSAGES) {
  globalThis.__HOLVA_SERVER_CHAT_MESSAGES = [...INITIAL_CHAT_MESSAGES];
}

function mergeAndDeduplicate(a: RealtimeChatMessage[], b: RealtimeChatMessage[]): RealtimeChatMessage[] {
  const combined = [...(a || []), ...(b || [])].filter((m) => Boolean(m && m.id && m.text));
  combined.sort((x, y) => (x.timestamp || 0) - (y.timestamp || 0));

  const result: RealtimeChatMessage[] = [];
  const seenIds = new Set<string>();

  for (const msg of combined) {
    if (seenIds.has(msg.id)) continue;

    const isDuplicate = result.some(
      (existing) =>
        (existing.agentId || "sardor") === (msg.agentId || "sardor") &&
        existing.sender === msg.sender &&
        existing.text.trim() === msg.text.trim() &&
        Math.abs((existing.timestamp || 0) - (msg.timestamp || 0)) < 120000
    );

    if (!isDuplicate) {
      seenIds.add(msg.id);
      result.push(msg);
    }
  }

  return result;
}

// GET /api/sync/chat?agentId=sardor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const all = globalThis.__HOLVA_SERVER_CHAT_MESSAGES || [...INITIAL_CHAT_MESSAGES];
    const dedupedAll = mergeAndDeduplicate(INITIAL_CHAT_MESSAGES, all);
    globalThis.__HOLVA_SERVER_CHAT_MESSAGES = dedupedAll;

    const filtered = agentId
      ? dedupedAll.filter((m) => (m.agentId || "sardor") === agentId)
      : dedupedAll;

    return NextResponse.json({
      success: true,
      messages: filtered,
      allMessages: dedupedAll,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/chat — Yangi xabar yoki xabarlar ro'yxatini sinxronlash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, sender, senderName, text, clientMessages, newMessage } = body;

    let currentServer = globalThis.__HOLVA_SERVER_CHAT_MESSAGES || [...INITIAL_CHAT_MESSAGES];

    // 1. Agar tayyor yangi xabar obyekti berilgan bo'lsa
    if (newMessage && newMessage.id) {
      currentServer = mergeAndDeduplicate(currentServer, [newMessage]);
    }
    // 2. Agar clientMessages berilgan bo'lsa
    else if (Array.isArray(clientMessages) && clientMessages.length > 0) {
      currentServer = mergeAndDeduplicate(currentServer, clientMessages);
    }
    // 3. Agar faqat oddiy matn kelgan bo'lsa
    else if (text && agentId && sender) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const created: RealtimeChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        agentId: agentId || "sardor",
        sender,
        senderName: senderName || (sender === "admin" ? "Super Admin" : "Sardor Rahimov"),
        text: String(text).trim(),
        time: timeStr,
        timestamp: Date.now(),
      };

      currentServer = mergeAndDeduplicate(currentServer, [created]);
    }

    globalThis.__HOLVA_SERVER_CHAT_MESSAGES = currentServer;

    const agentMessages = agentId
      ? currentServer.filter((m) => (m.agentId || "sardor") === agentId)
      : currentServer;

    return NextResponse.json({
      success: true,
      messages: agentMessages,
      allMessages: currentServer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
