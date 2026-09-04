import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRealSupabaseConfigured } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username = "", password = "" } = body;

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Sotuv Agenti
    const isAgent =
      cleanUser === "sotuv agent" ||
      cleanUser === "sotuvagent" ||
      cleanUser === "agent" ||
      cleanUser === "agent@holva.uz";

    if (isAgent) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: "agent-1",
          full_name: "Sardor Rahimov",
          username: "Sotuv agent",
          role: "SALES_AGENT",
        },
        redirectUrl: "/agent/home",
      });

      response.cookies.set("demo_session", "SALES_AGENT", {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // 2. Super Admin / Boshqa barcha foydalanuvchilar
    const response = NextResponse.json({
      success: true,
      user: {
        id: "super-admin-id",
        full_name: "Super Admin",
        username: "SUPER ADMIN",
        role: "SUPER_ADMIN",
      },
      redirectUrl: "/dashboard",
    });

    response.cookies.set("demo_session", "SUPER_ADMIN", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Server bilan bog'lanishda xatolik" },
      { status: 500 }
    );
  }
}
