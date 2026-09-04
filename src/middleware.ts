import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isRealSupabaseConfigured(url?: string, key?: string): boolean {
  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    !url.includes("mock-") &&
    !url.includes("your_supabase") &&
    !url.includes("placeholder") &&
    key.length > 30
  )
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = isRealSupabaseConfigured(supabaseUrl, supabaseAnonKey)
  const isDemo = request.cookies.get("demo_session")?.value
  const { pathname } = request.nextUrl
  const publicRoutes = ["/login", "/register", "/forgot-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (!isConfigured) {
    if (!isDemo && !isPublicRoute) {
      supabaseResponse.cookies.set("demo_session", "SUPER_ADMIN", {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      })
    }
    if (pathname === "/login" && isDemo) {
      const url = request.nextUrl.clone()
      url.pathname = isDemo === "SALES_AGENT" ? "/agent/home" : "/dashboard"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  if (isDemo) {
    if (pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = isDemo === "SALES_AGENT" ? "/agent/home" : "/dashboard"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    if (user && isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch {
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
