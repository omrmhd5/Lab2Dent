"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

let scrollLockCount = 0;
let savedOverflow = "";

function acquireScrollLock() {
  if (scrollLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount++;
}

function releaseScrollLock() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedOverflow;
  }
}

type ModalOverlayProps = {
  zIndex?: number;
  backdropClassName?: string;
  onBackdropClick?: () => void;
  children: ReactNode;
  scrollable?: boolean;
};

export function ModalOverlay({
  zIndex = 50,
  backdropClassName = "bg-black/50",
  onBackdropClick,
  children,
  scrollable = true,
}: ModalOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    acquireScrollLock();
    return releaseScrollLock;
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 overscroll-none ${backdropClassName} ${
        scrollable ? "overflow-y-auto" : "overflow-hidden"
      }`}
      style={{ zIndex }}
      onClick={onBackdropClick}>
      <div className="flex min-h-dvh w-full items-center justify-center p-4">
        <div onClick={(event) => event.stopPropagation()}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
