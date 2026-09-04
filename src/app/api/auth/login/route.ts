import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRealSupabaseConfigured } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username = "", password = "" } = body;

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Super Admin (SUPER ADMIN, admin, admin@holva.uz)
    const isSuperAdminUsername =
      cleanUser === "super admin" ||
      cleanUser === "superadmin" ||
      cleanUser === "admin" ||
      cleanUser === "admin@holva.uz" ||
      cleanUser === "super_admin";

    if (isSuperAdminUsername) {
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

    // 2. Sotuv Agenti (Sotuv agent / 0123)
    if (
      (cleanUser === "sotuv agent" || cleanUser === "sotuvagent" || cleanUser === "agent" || cleanUser === "agent@holva.uz") &&
      cleanPass === "0123"
    ) {
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
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // 3. Supabase Auth
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const email = cleanUser.includes("@") ? cleanUser : `${cleanUser}@holva.uz`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: cleanPass,
        });

        if (!error && data.user) {
          const response = NextResponse.json({
            success: true,
            user: {
              id: data.user.id,
              full_name: data.user.email?.split("@")[0] || "Admin",
              role: "ADMIN",
            },
            redirectUrl: "/dashboard",
          });

          response.cookies.set("demo_session", "ADMIN", {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
          });

          return response;
        }
      } catch (err) {
        console.error("Supabase auth error:", err);
      }
    }

    return NextResponse.json(
      { error: "Noto'g'ri login yoki parol kiritildi" },
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
