import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  if (!process.env.DEMO_ACCESS_CODE || code === process.env.DEMO_ACCESS_CODE) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("dawson-demo-access", "granted", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
    return response;
  }
  return NextResponse.json({ error: "Invalid code" }, { status: 401 });
}
