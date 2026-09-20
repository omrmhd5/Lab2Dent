"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CaretDown, CaretUp, DotsSixVertical } from "@phosphor-icons/react";
import { CategoryForm } from "@/components/admin/category-form";
import { reorderCategories } from "@/server/actions/categories";

type Category = {
  id: string;
  name: string;
  priceEgp: number;
  isActive: boolean;
};

function moveItem(list: Category[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function CategoryList({ initial }: { initial: Category[] }) {
  const [rows, setRows] = useState(initial);
  const rowsRef = useRef(rows);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const overIdRef = useRef<string | null>(null);
  const [pending, start] = useTransition();
  const signature = initial.map((row) => row.id).join();

  useEffect(() => {
    setRows(initial);
    // Re-sync when the server list identity changes (add/remove), not every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- signature tracks id order
  }, [signature]);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  function persist(next: Category[]) {
    setRows(next);
    start(async () => {
      await reorderCategories(next.map((row) => row.id));
    });
  }

  function move(id: string, direction: -1 | 1) {
    const from = rows.findIndex((row) => row.id === id);
    persist(moveItem(rows, from, from + direction));
  }

  function finishDrag() {
    const fromId = draggingIdRef.current;
    const toId = overIdRef.current;
    draggingIdRef.current = null;
    overIdRef.current = null;
    setDraggingId(null);
    setOverId(null);
    if (!fromId || !toId || fromId === toId) return;
    const list = rowsRef.current;
    const from = list.findIndex((row) => row.id === fromId);
    const to = list.findIndex((row) => row.id === toId);
    persist(moveItem(list, from, to));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Drag the handle to set the order students see. Use the arrows if you
        prefer not to drag.
      </p>
      <ul className="space-y-3" aria-busy={pending}>
        {rows.map((row, index) => {
          const dragging = draggingId === row.id;
          const over = overId === row.id && draggingId !== row.id;
          return (
            <li
              key={row.id}
              data-category-id={row.id}
              className={`ui-card flex items-center gap-3 ${over ? "ring-2 ring-brand" : ""} ${
                dragging ? "opacity-50" : ""
              }`}>
              <div className="flex shrink-0 flex-col items-center gap-0">
                <button
                  type="button"
                  className="ui-press grid size-9 place-items-center rounded-lg text-muted disabled:opacity-40"
                  aria-label={`Move ${row.name} up`}
                  disabled={index === 0 || pending}
                  onClick={() => move(row.id, -1)}>
                  <CaretUp size={14} weight="bold" aria-hidden="true" />
                </button>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag to reorder ${row.name}`}
                  className="grid size-9 cursor-grab touch-none place-items-center rounded-lg text-muted select-none active:cursor-grabbing"
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingIdRef.current = row.id;
                    overIdRef.current = row.id;
                    setDraggingId(row.id);
                    setOverId(row.id);
                  }}
                  onPointerMove={(event) => {
                    if (!draggingIdRef.current) return;
                    const node = document
                      .elementFromPoint(event.clientX, event.clientY)
                      ?.closest("[data-category-id]");
                    const nextOver = node?.getAttribute("data-category-id");
                    if (nextOver && nextOver !== overIdRef.current) {
                      overIdRef.current = nextOver;
                      setOverId(nextOver);
                    }
                  }}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}>
                  <DotsSixVertical size={18} weight="bold" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  className="ui-press grid size-9 place-items-center rounded-lg text-muted disabled:opacity-40"
                  aria-label={`Move ${row.name} down`}
                  disabled={index === rows.length - 1 || pending}
                  onClick={() => move(row.id, 1)}>
                  <CaretDown size={14} weight="bold" aria-hidden="true" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <CategoryForm category={row} layout="row" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
