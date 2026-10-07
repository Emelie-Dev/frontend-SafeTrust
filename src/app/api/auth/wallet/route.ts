import { NextResponse } from "next/server";
import {
  checkRateLimit,
  hasTrustedWalletAuthOrigin,
  issueWalletChallenge,
  verifyWalletChallenge,
  WalletAuthServiceError,
} from "@/lib/auth/wallet-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  try {
    checkRateLimit(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    if ("account" in body && typeof body.account === "string") {
      const result = await issueWalletChallenge(body.account);
      return NextResponse.json(result, {
        headers: { "cache-control": "no-store" },
      });
    }

    if ("transaction" in body && typeof body.transaction === "string") {
      const result = await verifyWalletChallenge(body.transaction);
      return NextResponse.json(result, {
        headers: { "cache-control": "no-store" },
      });
    }

    return NextResponse.json(
      { error: "Invalid request parameters." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof WalletAuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: { "cache-control": "no-store" } },
      );
    }
    return NextResponse.json(
      { error: "Wallet authentication is temporarily unavailable." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
