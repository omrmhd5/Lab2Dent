"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";
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
  const t = useDash();
  const roleOptions = useMemo(
    () => [
      { value: "employee", label: t.roleEmployee },
      { value: "lab", label: t.roleLab },
      { value: "admin", label: t.roleAdmin },
    ],
    [t.roleEmployee, t.roleLab, t.roleAdmin],
  );
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
    if (!state) return;
    reportAction(state, employee ? t.staffSaved : t.staffAdded);
    if ("ok" in state && state.ok) onSuccess?.();
    // onSuccess identity changes when the parent re-renders; only the action result should toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const universityOptions = [
    { value: "", label: t.anyUniversity },
    ...universities,
  ];
  const categoryOptions = [
    { value: "", label: t.anyCategory },
    ...categories,
  ];

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {employee ? <input type="hidden" name="id" value={employee.id} /> : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">{t.name}</span>
        <input
          className="ui-input min-w-40"
          name="name"
          defaultValue={employee?.name ?? ""}
          required
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">{t.email}</span>
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
          {employee ? t.newPassword : t.password}
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
        <span className="block text-xs text-muted">{t.role}</span>
        <SelectMenu
          name="role"
          value={role}
          onChange={(next) => setRole(next as StaffRole)}
          options={
            soleAdmin
              ? roleOptions.filter((option) => option.value === "admin")
              : roleOptions
          }
        />
      </label>
      {role === "employee" ? (
        <label className="space-y-1">
          <span className="block text-xs text-muted">{t.university}</span>
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
          <span className="block text-xs text-muted">{t.category}</span>
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
          {t.active}
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {pending ? <Spinner /> : null}
        {pending ? t.saving : employee ? t.save : t.addStaff}
      </button>
      {state && "error" in state && state.error ? (
        <p className="w-full text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
