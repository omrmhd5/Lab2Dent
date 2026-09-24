"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/admin/category-manager";
import { DeleteIconButton } from "@/components/admin/icon-action-buttons";
import { deleteCategory } from "@/server/actions/categories";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";

export function CategoryGroupDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const t = useDash();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function confirmDelete() {
    setNotice(null);
    start(async () => {
      const result = await deleteCategory(id);
      reportAction(result, t.categoryDeleted);
      if (result && "error" in result && result.error) {
        setNotice(result.error);
        return;
      }
      setOpen(false);
      if (pathname === `/dashboard/categories/${id}`) {
        router.push("/dashboard/categories");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <DeleteIconButton
        label={t.deleteCategoryLabel}
        onClick={() => {
          setNotice(null);
          setOpen(true);
        }}
      />
      {open ? (
        <ConfirmDeleteDialog
          target={{ id, name, kind: "group" }}
          pending={pending}
          notice={notice}
          onConfirm={confirmDelete}
          onCancel={() => {
            setOpen(false);
            setNotice(null);
          }}
        />
      ) : null}
    </>
  );
}
