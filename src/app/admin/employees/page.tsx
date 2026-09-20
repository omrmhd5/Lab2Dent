import { requireAdminSession } from "@/lib/auth";
import { listEmployees } from "@/server/actions/employees";
import { EmployeeForm } from "@/components/admin/employee-form";

export default async function EmployeesPage() {
  await requireAdminSession();
  const rows = await listEmployees();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Add staff who can review orders. Only admins see this page.
        </p>
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">Add employee</h2>
        <EmployeeForm />
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="ui-card">
            <EmployeeForm employee={row} />
          </li>
        ))}
      </ul>
    </div>
  );
}
