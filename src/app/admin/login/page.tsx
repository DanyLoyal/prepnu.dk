import type { Metadata } from "next";
import { ShieldIcon } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-olive-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-olive-800 bg-olive-900 p-8 shadow-xl">
        <div className="flex items-center gap-2 text-stone-50">
          <ShieldIcon className="h-6 w-6 text-orange-400" />
          <span className="heading-font text-lg font-semibold uppercase tracking-wide">
            Beredskab admin
          </span>
        </div>
        <p className="mt-2 text-sm text-stone-400">Log ind for at administrere butikken.</p>
        <div className="mt-6 rounded-lg bg-stone-50 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
