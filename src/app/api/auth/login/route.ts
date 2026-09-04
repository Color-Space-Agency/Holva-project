import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {}

    const { username = "", password = "" } = body
    const cleanUser = String(username).trim().toLowerCase()
    const cleanPass = String(password).trim()

    // Check if Sales Agent login
    const isAgent =
      cleanUser.includes("agent") ||
      cleanUser.includes("sotuv") ||
      cleanPass === "0123 font" ||
      cleanPass === "0123"

    const role = isAgent ? "SALES_AGENT" : "SUPER_ADMIN"
    const redirectUrl = isAgent ? "/agent/home" : "/dashboard"
    const fullName = isAgent ? "Sardor Rahimov" : "Super Admin"

    const response = NextResponse.json({
      success: true,
      user: {
        id: isAgent ? "agent-1" : "super-admin-id",
        full_name: fullName,
        username: username || (isAgent ? "Sotuv agent" : "SUPER ADMIN"),
        role,
      },
      redirectUrl,
    })

    response.cookies.set("demo_session", role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })

    return response
  } catch (error: any) {
    const response = NextResponse.json({
      success: true,
      user: {
        id: "super-admin-id",
        full_name: "Super Admin",
        username: "SUPER ADMIN",
        role: "SUPER_ADMIN",
      },
      redirectUrl: "/dashboard",
    })

    response.cookies.set("demo_session", "SUPER_ADMIN", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })

    return response
  }
}
