import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Login-siden har intet sidebar/topbar-skelet og styrer selv sin visning.
  // proxy.ts er den primære vagt; dette er et sekundært forsvarslag pr.
  // Next.js' egne anbefalinger (proxy bør ikke være eneste adgangskontrol).
  if (!session?.user) {
    return children;
  }

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar email={session.user.email} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
