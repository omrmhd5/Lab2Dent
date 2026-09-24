import { InstapaySettingsForm } from "@/components/admin/instapay-settings-form";
import { getDash } from "@/i18n/dashboard";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getInstapayConfig } from "@/lib/settings";

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const t = getDash(await getLocale());
  const instapay = await getInstapayConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings}</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">{t.settingsIntro}</p>
      </div>
      <InstapaySettingsForm instapayLink={instapay.link} />
    </div>
  );
}
