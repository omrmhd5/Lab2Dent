import { InstapaySettingsForm } from "@/components/admin/instapay-settings-form";
import { requireAdminSession } from "@/lib/auth";
import { getInstapayConfig } from "@/lib/settings";

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const instapay = await getInstapayConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Payment details shown to students when they register a case.
        </p>
      </div>
      <InstapaySettingsForm instapayLink={instapay.link} />
    </div>
  );
}
