import { signOut } from "@/lib/auth";
import { LogOutIcon } from "@/components/icons";

export function AdminTopbar({ email }: { email?: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
      <p className="text-sm text-stone-500">Administrationspanel</p>
      <div className="flex items-center gap-4">
        {email ? <span className="text-sm text-stone-500">{email}</span> : null}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-orange-600"
          >
            <LogOutIcon className="h-4 w-4" />
            Log ud
          </button>
        </form>
      </div>
    </header>
  );
}
