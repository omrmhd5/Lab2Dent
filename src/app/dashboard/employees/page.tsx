import { EmployeeForm } from "@/components/admin/employee-form";
import { StaffTable } from "@/components/admin/staff-table";
import { pickLocale } from "@/lib/bilingual";
import { getDash } from "@/i18n/dashboard";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { isCategoryGroup } from "@/lib/categories";
import { listCategories } from "@/server/actions/categories";
import { listEmployees } from "@/server/actions/employees";
import { listUniversities } from "@/server/actions/universities";

export default async function EmployeesPage() {
  const [session, locale] = await Promise.all([
    requireAdminSession(),
    getLocale(),
  ]);
  const t = getDash(locale);
  const [rows, universities, categories] = await Promise.all([
    listEmployees(),
    listUniversities(true),
    listCategories(true),
  ]);

  const universityOptions = universities.map((row) => ({
    value: row.id,
    label: pickLocale(locale, row.name, row.nameAr),
  }));
  const categoryOptions = categories.filter(isCategoryGroup).map((row) => ({
    value: row.id,
    label: pickLocale(locale, row.name, row.nameAr),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.staff}</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">{t.staffIntro}</p>
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">{t.addStaff}</h2>
        <EmployeeForm
          universities={universityOptions}
          categories={categoryOptions}
        />
      </div>
      <StaffTable
        initial={rows}
        universities={universityOptions}
        categories={categoryOptions}
        currentStaffId={session.staffId}
      />
    </div>
  );
}
