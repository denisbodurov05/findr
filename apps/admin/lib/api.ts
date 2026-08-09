import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import type { LayoutCell, ProductDto, StoreMap as StoreDto, StoreSummary } from "@findr/types";

import { firebaseApp } from "@/lib/firebase";
import { ApiError } from "@/lib/types";

const API_URL = "/api/v1";

async function request(path: string, init?: RequestInit) {
  const user = getAuth(firebaseApp).currentUser;
  if (!user) {
    throw new ApiError(401, "Your session has expired. Please sign in again.", "not_authenticated");
  }

  const token = await user.getIdToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = "The request could not be completed.";
    let code: string | undefined;
    try {
      const problem = await res.json() as { detail?: unknown; error?: unknown };
      if (typeof problem.detail === "string") detail = problem.detail;
      if (typeof problem.error === "string") code = problem.error;
    } catch {
      // Empty and non-JSON error responses are valid; use the generic message.
    }
    throw new ApiError(res.status, detail, code);
  }

  return res;
}

export async function authenticate(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
}

export async function getMe(): Promise<{ email: string; role: string }> {
  const res = await request("/auth/me");
  return res.json();
}

export async function getStores(): Promise<StoreSummary[]> {
  const res = await request("/store");
  return res.json();
}

export async function getStore(storeId: number, signal?: AbortSignal): Promise<StoreDto> {
  const res = await request(`/store/${storeId}`, { signal });
  return res.json();
}

export async function getProducts(): Promise<Record<string, ProductDto[]>> {
  const res = await request("/products/grouped-by-categories");
  return res.json();
}

export async function saveLayout(storeId: number, cells: LayoutCell[]): Promise<void> {
  await request(`/store/${storeId}/layout`, {
    method: "PUT",
    body: JSON.stringify(cells),
  });
}

export async function createStore(name: string): Promise<StoreSummary> {
  const res = await request("/store", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteStore(storeId: number): Promise<void> {
  await request(`/store/${storeId}`, {
    method: "DELETE",
  });
}
