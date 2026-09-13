import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (!process.env.DEMO_ACCESS_CODE) return NextResponse.next();
  if (request.cookies.get("dawson-demo-access")?.value === "granted") return NextResponse.next();
  return NextResponse.redirect(new URL("/access", request.url));
}

export const config = { matcher: ["/((?!api/access|access|_next/static|_next/image|favicon.ico).*)"] };
