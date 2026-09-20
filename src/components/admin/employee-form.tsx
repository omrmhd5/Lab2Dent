"use client";

import { useActionState } from "react";
import { createEmployee, updateEmployee } from "@/server/actions/employees";
import { SelectMenu } from "@/components/select-menu";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  isActive: boolean;
};

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const action = employee ? updateEmployee : createEmployee;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {employee ? <input type="hidden" name="id" value={employee.id} /> : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">Name</span>
        <input className="ui-input min-w-40" name="name" defaultValue={employee?.name ?? ""} required />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">Email</span>
        <input
          className="ui-input min-w-52"
          name="email"
          type="email"
          defaultValue={employee?.email ?? ""}
          required
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">
          {employee ? "New password" : "Password"}
        </span>
        <input
          className="ui-input min-w-40"
          name="password"
          type="password"
          minLength={employee ? undefined : 8}
          required={!employee}
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">Role</span>
        <SelectMenu
          name="role"
          defaultValue={employee?.role ?? "employee"}
          options={[
            { value: "employee", label: "Employee" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </label>
      {employee ? (
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={employee.isActive} />
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary"
      >
        {employee ? "Save" : "Add employee"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
