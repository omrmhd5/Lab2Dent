"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/admin/category-manager";
import { DeleteIconButton } from "@/components/admin/icon-action-buttons";
import { deleteCategory } from "@/server/actions/categories";

export function CategoryGroupDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function confirmDelete() {
    setNotice(null);
    start(async () => {
      const result = await deleteCategory(id);
      if (result && "error" in result && result.error) {
        setNotice(result.error);
        return;
      }
      setOpen(false);
      if (pathname === `/admin/categories/${id}`) {
        router.push("/admin/categories");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <DeleteIconButton
        label="Delete category"
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
