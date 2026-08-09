import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8890";

const FORWARD_HEADERS = new Set(["authorization", "content-type"]);

async function proxy(request: NextRequest, pathSegments: string[]) {
  const target = new URL(`/api/${pathSegments.join("/")}`, BACKEND);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(target, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return Response.json(
      { error: "upstream_unavailable", detail: "The Findr API is unavailable." },
      { status: 502 },
    );
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: {
      "cache-control": "no-store",
      "content-type": backendRes.headers.get("content-type") ?? "application/octet-stream",
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, (await params).path ?? []);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, (await params).path ?? []);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, (await params).path ?? []);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, (await params).path ?? []);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, (await params).path ?? []);
}
