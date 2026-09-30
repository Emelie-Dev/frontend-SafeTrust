import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "WALLET_AUTH_UNAVAILABLE" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${backend}/api/auth/wallet/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "WALLET_AUTH_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
