"use client";

import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
