import { BrandLogo } from "@/components/BrandLogo";

interface Props {
  email: string;
  password: string;
  authError: string | null;
  authBusy: boolean;
  onEmailChange(value: string): void;
  onPasswordChange(value: string): void;
  onSubmit(event: React.FormEvent): void;
}

export function LoginForm({ email, password, authError, authBusy, onEmailChange, onPasswordChange, onSubmit }: Props) {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-100 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <BrandLogo />
          <span className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Admin Panel
          </span>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-500" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500" />

        <label className="mb-1 block text-sm font-medium text-slate-500" htmlFor="password">Password</label>
        <input id="password" type="password" required value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500" />

        {authError ? <p className="mb-4 text-sm text-red-600">{authError}</p> : null}

        <button type="submit" disabled={authBusy}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50">
          {authBusy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
