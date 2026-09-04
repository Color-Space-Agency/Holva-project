import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  
  const response = NextResponse.redirect(url);
  
  response.cookies.set("demo_session", "SUPER_ADMIN", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
