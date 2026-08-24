import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your_supabase_url" &&
    !supabaseUrl.includes("your_supabase")

  const { pathname } = request.nextUrl
  const publicRoutes = ["/login", "/register", "/forgot-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Agar demo rejimida bo'lsa (haqiqiy Supabase kiritilmagan yoki demo cookie mavjud)
  const isDemo = request.cookies.get("demo_session")?.value

  if (!isConfigured || isDemo) {
    if (pathname === "/login" && isDemo) {
      const url = request.nextUrl.clone()
      url.pathname = isDemo === "SALES_AGENT" ? "/agent/home" : "/dashboard"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
    // Supabase aloqasida xatolik bo'lsa o'tkazib yuborish
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
