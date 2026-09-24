import { AdminNav } from "@/components/admin/admin-nav";
import { DashboardEnter } from "@/components/dashboard-enter";
import { DashboardI18n } from "@/components/dashboard-i18n";
import { getDash } from "@/i18n/dashboard";
import { requireStaffSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, locale] = await Promise.all([
    requireStaffSession(),
    getLocale(),
  ]);
  const copy = getDash(locale);

  return (
    <DashboardI18n copy={copy}>
      <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row md:overflow-hidden">
        <AdminNav
          role={session.role}
          name={session.name}
          email={session.email}
        />
        <div className="min-h-0 min-w-0 flex-1 md:overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
            <DashboardEnter>{children}</DashboardEnter>
          </div>
        </div>
      </div>
    </DashboardI18n>
  );
}
