import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { status: "error", message: "NEXT_PUBLIC_API_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json({
      status: "ok",
      frontend: "healthy",
      backend: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        frontend: "healthy",
        backend: "unreachable",
        error: String(err),
      },
      { status: 200 } // Still 200 — frontend is up, backend might be cold-starting
    );
  }
}
