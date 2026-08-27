import { NextRequest, NextResponse } from "next/server";
import { RealtimeChatMessage, INITIAL_CHAT_MESSAGES } from "@/lib/mock-data";

// Global server in-memory store across requests
declare global {
  var __HOLVA_SERVER_CHAT_MESSAGES: RealtimeChatMessage[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_CHAT_MESSAGES) {
  globalThis.__HOLVA_SERVER_CHAT_MESSAGES = [...INITIAL_CHAT_MESSAGES];
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

// POST /api/sync/chat — Yangi xabar yuborish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, sender, senderName, text } = body;

    if (!text || !agentId || !sender) {
      return NextResponse.json({ success: false, error: "Ma'lumotlar yetarli emas" }, { status: 400 });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: RealtimeChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      agentId: agentId || "sardor",
      sender,
      senderName: senderName || (sender === "admin" ? "Super Admin" : "Sardor Rahimov"),
      text: String(text).trim(),
      time: timeStr,
      timestamp: Date.now(),
    };

    if (!globalThis.__HOLVA_SERVER_CHAT_MESSAGES) {
      globalThis.__HOLVA_SERVER_CHAT_MESSAGES = [...INITIAL_CHAT_MESSAGES];
    }

    globalThis.__HOLVA_SERVER_CHAT_MESSAGES.push(newMsg);

    const agentMessages = globalThis.__HOLVA_SERVER_CHAT_MESSAGES.filter(
      (m) => (m.agentId || "sardor") === agentId
    );

    return NextResponse.json({
      success: true,
      newMessage: newMsg,
      messages: agentMessages,
      allMessages: globalThis.__HOLVA_SERVER_CHAT_MESSAGES,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
