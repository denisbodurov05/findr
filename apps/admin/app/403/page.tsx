"use client";

import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";
import { BrandLogo } from "@/components/BrandLogo";

export default function NoAccessPage() {
  const router = useRouter();

  function handleSignOut() {
    void signOut(getAuth(firebaseApp));
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <BrandLogo />
          <span className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Admin Panel
          </span>
        </div>

        <p className="mb-6 text-sm text-slate-600">You do not have admin access.</p>

        <button onClick={handleSignOut}
          className="rounded-lg border border-slate-300 px-6 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
          Sign out
        </button>
      </div>
    </main>
  );
}
