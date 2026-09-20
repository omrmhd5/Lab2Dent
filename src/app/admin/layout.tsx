import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaffSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaffSession();

  return (
    <div className="min-h-[100dvh] bg-background">
      <AdminNav isAdmin={session.role === "admin"} />
      <div className="mx-auto max-w-[1400px] px-4 py-8">{children}</div>
    </div>
  );
}
