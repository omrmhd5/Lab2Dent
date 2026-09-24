"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";

export type SelectOption = { value: string; label: string };

export function SelectMenu({
  name,
  value,
  defaultValue = "",
  onChange,
  options,
  placeholder = "Select",
  labelId,
  ariaLabel,
  emptyLabel = "Nothing to choose",
  className = "",
  menuPlacement = "down",
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  labelId?: string;
  ariaLabel?: string;
  emptyLabel?: string;
  className?: string;
  menuPlacement?: "up" | "down";
}) {
  const listboxId = useId();
  const optionId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const selectedOption = options.find((option) => option.value === selected);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === selected),
    ),
  );

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    if (value === undefined) {
      setInternal(next);
    }
    onChange?.(next);
    setOpen(false);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(
        Math.max(
          0,
          options.findIndex((option) => option.value === selected),
        ),
      );
    }
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (options.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + options.length) % options.length,
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option.value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      <button
        type="button"
        className="ui-press ui-input flex w-full cursor-pointer items-center justify-between gap-3 text-start whitespace-nowrap"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-label={ariaLabel}
        onClick={() => {
          setActiveIndex(
            Math.max(
              0,
              options.findIndex((option) => option.value === selected),
            ),
          );
          setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}>
        <span className={selectedOption ? "font-bold" : "text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          data-placement={menuPlacement}
          role="listbox"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-activedescendant={
            options[activeIndex] ? `${optionId}-${activeIndex}` : undefined
          }
          onKeyDown={onListKeyDown}
          className={`menu-pop absolute start-0 z-50 max-h-[min(20rem,70vh)] w-max min-w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-surface p-1 shadow-[var(--shadow-lg)] outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            menuPlacement === "up"
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]"
          }`}>
          {options.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">{emptyLabel}</li>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === selected;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${optionId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-start text-sm font-bold whitespace-nowrap ${
                    isActive ? "bg-brand-soft text-brand" : ""
                  } ${isSelected && !isActive ? "text-brand" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(option.value);
                  }}>
                  {option.label}
                  {isSelected ? (
                    <Check size={16} weight="bold" aria-hidden="true" />
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
