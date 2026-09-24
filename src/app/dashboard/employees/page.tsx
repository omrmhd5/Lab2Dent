import { EmployeeForm } from "@/components/admin/employee-form";
import { StaffTable } from "@/components/admin/staff-table";
import { requireAdminSession } from "@/lib/auth";
import { isCategoryGroup } from "@/lib/categories";
import { listCategories } from "@/server/actions/categories";
import { listEmployees } from "@/server/actions/employees";
import { listUniversities } from "@/server/actions/universities";

export default async function EmployeesPage() {
  const session = await requireAdminSession();
  const [rows, universities, categories] = await Promise.all([
    listEmployees(),
    listUniversities(true),
    listCategories(true),
  ]);

  const universityOptions = universities.map((row) => ({
    value: row.id,
    label: row.name,
  }));
  const categoryOptions = categories.filter(isCategoryGroup).map((row) => ({
    value: row.id,
    label: row.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Admins see everything. Assign an employee a university, a category, or
          both. Assign each lab account one category.
        </p>
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">Add staff</h2>
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
