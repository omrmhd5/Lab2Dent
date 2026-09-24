import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaffSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaffSession();

  return (
    <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row md:overflow-hidden">
      <AdminNav role={session.role} name={session.name} email={session.email} />
      <div className="min-h-0 min-w-0 flex-1 md:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
