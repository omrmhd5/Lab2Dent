"use client";

import { useActionState, useEffect, useState } from "react";
import { createEmployee, updateEmployee } from "@/server/actions/employees";
import { SelectMenu } from "@/components/select-menu";
import type { StaffRole } from "@/db/schema";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  universityId: string | null;
  categoryId: string | null;
};

type Option = { value: string; label: string };

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "lab", label: "Lab" },
  { value: "admin", label: "Admin" },
];

export function EmployeeForm({
  employee,
  universities,
  categories,
  onSuccess,
  soleAdmin = false,
}: {
  employee?: StaffRow;
  universities: Option[];
  categories: Option[];
  onSuccess?: () => void;
  soleAdmin?: boolean;
}) {
  const action = employee ? updateEmployee : createEmployee;
  const [role, setRole] = useState<StaffRole>(employee?.role ?? "employee");
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; ok?: true } | undefined,
      formData: FormData,
    ) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) onSuccess?.();
  }, [state, onSuccess]);

  const universityOptions = [
    { value: "", label: "Any university" },
    ...universities,
  ];
  const categoryOptions = [{ value: "", label: "Any category" }, ...categories];

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {employee ? <input type="hidden" name="id" value={employee.id} /> : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">Name</span>
        <input
          className="ui-input min-w-40"
          name="name"
          defaultValue={employee?.name ?? ""}
          required
        />
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
          value={role}
          onChange={(next) => setRole(next as StaffRole)}
          options={
            soleAdmin
              ? ROLE_OPTIONS.filter((option) => option.value === "admin")
              : ROLE_OPTIONS
          }
        />
      </label>
      {role === "employee" ? (
        <label className="space-y-1">
          <span className="block text-xs text-muted">University</span>
          <SelectMenu
            name="universityId"
            className="w-56"
            defaultValue={employee?.universityId ?? ""}
            options={universityOptions}
          />
        </label>
      ) : (
        <input type="hidden" name="universityId" value="" />
      )}
      {role === "employee" ? (
        <label className="space-y-1">
          <span className="block text-xs text-muted">Category</span>
          <SelectMenu
            name="categoryId"
            className="w-56"
            defaultValue={employee?.categoryId ?? ""}
            options={categoryOptions}
          />
        </label>
      ) : (
        <input type="hidden" name="categoryId" value="" />
      )}
      {employee ? (
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input
            type="checkbox"
            name={soleAdmin ? undefined : "isActive"}
            defaultChecked={soleAdmin ? true : employee.isActive}
            disabled={soleAdmin}
          />
          {soleAdmin ? (
            <input type="hidden" name="isActive" value="on" />
          ) : null}
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {pending ? "Saving…" : employee ? "Save" : "Add staff"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="w-full text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
