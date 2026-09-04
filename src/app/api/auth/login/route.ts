import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRealSupabaseConfigured } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username = "", password = "" } = body;

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Super Admin (Login: Super admin, Parol: 0321)
    const isSuperAdminUsername =
      cleanUser === "super admin" ||
      cleanUser === "superadmin" ||
      cleanUser === "admin" ||
      cleanUser === "admin@holva.uz" ||
      cleanUser === "super_admin";

    const isSuperAdminPass =
      cleanPass === "0321" || cleanPass === "admin" || cleanPass === "";

    if (isSuperAdminUsername && isSuperAdminPass) {
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
    }

    // 2. Sotuv Agenti (Login: Sotuv agent, Parol: 0123)
    const isAgentUsername =
      cleanUser === "sotuv agent" ||
      cleanUser === "sotuvagent" ||
      cleanUser === "agent" ||
      cleanUser === "agent@holva.uz";

    const isAgentPass = cleanPass === "0123" || cleanPass === "";

    if (isAgentUsername && isAgentPass) {
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

    // Agar hech qaysi biriga tushmasa (fallback ham Super Admin)
    if (cleanUser.length > 0) {
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
    }

    return NextResponse.json(
      { error: "Noto'g'ri login yoki parol! (Super admin uchun parol: 0321)" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Server bilan bog'lanishda xatolik" },
      { status: 500 }
    );
  }
}
